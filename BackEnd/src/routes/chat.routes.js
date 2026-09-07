const express = require("express");
const authMiddleware = require('../Middlewares/auth.middleware')
const chatController = require('../controllers/chat.controller')

const router = express.Router();




/* This route is used to create a new chat:   POST /api/chat/  */

router.post('/',authMiddleware.authUser,chatController.createChat)




module.exports = router;
