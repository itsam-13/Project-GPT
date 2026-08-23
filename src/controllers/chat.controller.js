const chatModel = require('../models/chat.model')

async function createChat(req, res) {
    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
        user: user._id,
        title
    });

    return res.status(201).json({
        message: "Chat created successfully",
        chat:{
            _id: chat._id,
            title: chat.title,
            lastActive: chat.lastActive,
            user: chat.user
        }
    })

}

module.exports = {createChat}