const express = require('express');
const router = express.Router();

const {
    sendMessage,
    clearMessages,
    getMessages,
} = require("../../controllers/chatsController");

router.route("/b/:boardId")
    .get(getMessages)
    .post(sendMessage)
    .delete(clearMessages)

module.exports = router;

