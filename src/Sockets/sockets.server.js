const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const aiService = require('../Services/ai.service')
const msgModel = require('../models/msg.model')
const { createMemory, queryMemory } = require('../Services/vector.service');


function initSocketServer(httpServer) {

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            // 1. Extract cookie safely (supports both cookie v2.x parseCookie and v0.x parse)
            const rawCookie = socket.handshake.headers?.cookie || '';
            const parseFn = cookie.parseCookie || cookie.parse;
            const cookies = typeof parseFn === 'function' ? parseFn(rawCookie) : {};

            // 2. Extract token from Cookies, Socket Auth object, Authorization Header, or Query
            const authHeader = socket.handshake.headers?.authorization;
            const bearerToken = authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : authHeader;

            const token = cookies.token
                || socket.handshake.auth?.token
                || bearerToken
                || socket.handshake.query?.token;

            if (!token) {
                return next(new Error("Authentication Error: no token provided"));
            }

            // 3. Verify JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find user in database
            const user = await userModel.findById(decoded.id);
            if (!user) {
                return next(new Error("Authentication Error: user not found"));
            }

            socket.user = user;
            return next();

        } catch (error) {
            console.error("Socket authentication error:", error.message);
            return next(new Error("Authentication Error: " + error.message));
        }
    });

    io.on("connection", (socket) => {
        console.log("New Socket Connected:", socket.id, "| User:", socket.user?.email || socket.user?._id);

        socket.on("ai-message", async (messagePayload) => {
            try {
                console.log("Received AI message:", messagePayload);

                const userMsg = await msgModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: messagePayload.content,
                    role: 'user'
                });

                // Vector & Memory
                const vectors = await aiService.generateVector(messagePayload.content);

                const memory = await queryMemory({
                    queryVectors: vectors,
                    limit: 5,
                    metadata: {
                        user: socket.user._id.toString()
                    }
                });

                await createMemory({
                    vectors,
                    metadata: {
                        id: userMsg._id.toString(),
                        user: socket.user._id.toString(),
                        chat: messagePayload.chat.toString(),
                        text: messagePayload.content,
                        role: 'user'
                    }
                });

                const chatHistory = (await msgModel.find({
                    chat: messagePayload.chat
                }).sort({ createdAt: -1 }).limit(20)).reverse();

                const stm = chatHistory.map(item => ({
                    role: item.role,
                    parts: [{
                        text: item.content
                    }]
                }));

                const ltm = (memory && memory.length > 0) ? [{
                    role: "user",
                    parts: [{
                        text: `These are some previous messages from the chat, use to generate a response:\n${memory.map(item => item.metadata?.text).filter(Boolean).join("\n")}`
                    }]
                }, {
                    role: "model",
                    parts: [{
                        text: "Understood, I will use these previous messages as context to assist you."
                    }]
                }] : [];

                console.log("LTM:", JSON.stringify(ltm, null, 2));
                console.log("STM:", JSON.stringify(stm, null, 2));

                const response = await aiService.generateResponse([...ltm, ...stm]);

                const responseVectors = await aiService.generateVector(response);

                const responseMsg = await msgModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: response,
                    role: 'model'
                });

                await createMemory({
                    vectors: responseVectors,
                    metadata: {
                        id: responseMsg._id.toString(),
                        user: socket.user._id.toString(),
                        chat: messagePayload.chat.toString(),
                        text: response,
                        role: 'model'
                    }
                });

                socket.emit('ai-response', {
                    content: response,
                    chat: messagePayload.chat
                });
            } catch (error) {
                console.error("AI Generation error:", error.message);
                socket.emit('ai-error', {
                    message: "Failed to generate AI response: " + error.message,
                    chat: messagePayload?.chat
                });
            }
        });
    });
}

module.exports = initSocketServer;

