const Chat = require("../models/Chat");
const Board = require("../models/Board");
const User = require("../models/User");

const getMessages = async (req, res) => {
    const { boardId } = req.params;

    const foundBoard = await Board.findById(boardId);
    if (!foundBoard) return res.status(403).json({ msg: "cannote send message, board not found" });

    const messages = await Chat
        .find({ boardId })
        .sort({ createdAt: 'desc' })
        .populate({
            path: 'sentBy',
            field: 'username'
        });

    res.json({ messages });
};

const sendMessage = async (req, res) => {
    const { username } = req.user;
    const { content } = req.body;
    const { boardId } = req.params;

    const foundBoard = await Board.findById(boardId);
    if (!foundBoard) return res.status(403).json({ msg: "cannot send message, board not found" });

    const foundUser = await User.findOne({ username });
    if (!foundUser) return res.status(403).json({ msg: "cannot send message, user not found" });

    const chat = new Chat({
        sentBy: foundUser._id,
        boardId,
        content,
    })

    await chat.save();
    res.status(200).json({ msg: "message is sent", chat });
};

const clearMessages = async (req, res) => {
    const { boardId } = req.body;
    await Chat.deleteMany({ boardId });
    res.status(200).json({ msg: "messages deleted" });
};

module.exports = {
    sendMessage,
    clearMessages,
    getMessages,
};
