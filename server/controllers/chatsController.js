const mongoose = require('mongoose');

const Chat = require("../models/Chat");
const Board = require("../models/Board");
const User = require("../models/User");

const userByUsername = (username) => {
    const foundUser = User.findOne({ username }).lean();
    return foundUser;
};

const boardById = (boardId) => {
    const foundBoard = Board.findById(boardId).lean();
    return foundBoard;
};

const getMessages = async (req, res) => {
    const { username } = req.user;
    const { boardId } = req.params;

    let { perPage, page } = req.query;

    perPage = +perPage || 10;
    page = +page || 1;

    const foundUser = await userByUsername(username);
    if (!foundUser) return res.status(403).json({ msg: "cannot send message, user not found" });

    const foundBoard = await boardById(boardId);
    if (!foundBoard) return res.status(403).json({ msg: "cannot send message, board not found" });

    const messages = await Chat
        .find({ boardId })
        .sort({ createdAt: 'desc' })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .populate({
            path: 'sentBy',
            field: 'username'
        });

    res.json({ messages });
};

const sendMessage = async (req, res) => {
    const { username } = req.user;
    const { content, trackedId } = req.body;
    const { boardId } = req.params;

    const foundBoard = await boardById(boardId);
    if (!foundBoard) return res.status(403).json({ msg: "cannot send message, board not found" });

    const foundUser = await userByUsername(username);
    if (!foundUser) return res.status(403).json({ msg: "cannot send message, user not found" });

    const chat = new Chat({
        sentBy: foundUser._id,
        trackedId,
        boardId,
        content,
    });

    const hasCardCodePreffix = chat.content.startsWith("!c ");
    const hasBoardCodePreffix = chat.content.startsWith("!b ");
    const type = hasCardCodePreffix ? 'CARD_CODE' : hasBoardCodePreffix ? 'BOARD_CODE' : 'MESSAGE';

    const isValidCode = mongoose.Types.ObjectId.isValid(chat.content.split(" ")[1]);
    if (isValidCode) chat.type = type;

    await chat.save();

    res.status(200).json({ msg: "message is sent", chat });
};

const deleteMessage = async (req, res) => {
    const { username } = req.user;
    const { trackedId } = req.params;

    const foundUser = await userByUsername(username);
    if (!foundUser) return res.status(403).json({ msg: "cannot send message, user not found" });

    const deletedMessage = await Chat.findOneAndDelete({ trackedId });
    res.status(200).json({ msg: "message deleted", deletedMessage });
};

const clearMessages = async (req, res) => {
    const { username } = req.user;
    const { boardId } = req.params;

    const foundUser = await userByUsername(username);
    if (!foundUser) return res.status(403).json({ msg: "cannot send message, user not found" });

    const foundBoard = await boardById(boardId);
    if (!foundBoard) return res.status(403).json({ msg: "cannot send message, board not found" });

    if (foundBoard.createdBy.toString() !== foundUser._id.toString()) {
        return res.status(401).json({ msg: 'Not authorize' });
    }

    await Chat.deleteMany({ boardId });
    res.status(200).json({ msg: "messages deleted" });
};

module.exports = {
    sendMessage,
    clearMessages,
    getMessages,
    deleteMessage
};
