const express = require('express');
const router = express.Router();

const {
    sendMessage,
    clearMessages,
    deleteMessage,
    getMessages,
} = require("../../controllers/chatsController");

router.route("/b/:boardId")
    .get(getMessages)
    .post(sendMessage)
    .delete(clearMessages)

router.route("/b/:boardId/chats/:trackedId")
    .delete(deleteMessage)

module.exports = router;

