const express = require("express");
const authMiddleware = require('../Middlewares/auth.middleware')
const chatController = require('../controllers/chat.controller')

const router = express.Router();




/* This route is used to create a new chat: POST /api/chat/ */
router.post('/', authMiddleware.authUser, chatController.createChat);

/* This route is used to get all user chats: GET /api/chat/ */
router.get('/', authMiddleware.authUser, chatController.getUserChats);

/* This route is used to get messages for a specific chat: GET /api/chat/:chatId/messages */
router.get('/:chatId/messages', authMiddleware.authUser, chatController.getChatMessages);

module.exports = router;
