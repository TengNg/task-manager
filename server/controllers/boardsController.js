const mongoose = require('mongoose');

const Board = require("../models/Board");
const List = require("../models/List");
const Card = require("../models/Card");
const User = require("../models/User");

const getUser = (username) => {
    const foundUser = User.findOne({ username });
    return foundUser;
};

const getBoards = async (req, res) => {
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const boards = await Board.find({
        $or: [
            { createdBy: foundUser._id },
            { members: foundUser._id },
        ]
    });

    return res.json(boards);
};

const getBoard = async (req, res) => {
    const { id } = req.params;
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const board = await Board.findOne({
        _id: id,
        $or: [
            { createdBy: foundUser._id },
            { members: foundUser._id },
        ],
    })
        .populate({
            path: 'createdBy',
            select: 'username profileImage createdAt'
        })
        .populate({
            path: 'members',
            select: 'username profileImage createdAt'
        });

    if (!board) return res.status(404).json({ msg: "board not found" });

    const lists = await List.find({ boardId: id }).sort({ order: 'asc' });

    const listsWithCardsPromises = lists.map(async (list) => {
        const cards = await Card.find({ listId: list._id }).sort({ order: 'asc' });
        return {
            ...list.toObject(),
            cards
        }
    })

    const listsWithCards = await Promise.all(listsWithCardsPromises);

    return res.json({
        board,
        lists: listsWithCards,
    });
}

const createBoard = async (req, res) => {
    const { title, description } = req.body;
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const newBoard = new Board({
        title,
        description,
        createdBy: foundUser._id
    });

    await newBoard.save();
    return res.status(201).json({ msg: 'new board created', newBoard });
};

const updateBoard = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const newBoard = await Board.findOneAndUpdate({ _id: id }, { title, description }, { new: true });
    return res.status(200).json({ msg: 'board updated', newBoard });
};

const updateTitle = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const newBoard = await Board.findOneAndUpdate({ _id: id }, { title }, { new: true });
    return res.status(200).json({ msg: 'board updated', newBoard });
};

const removeMemberFromBoard = async (req, res) => {
    try {
        const { username } = req.username;
        const { id, memberId } = req.params;

        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const foundUser = await getUser(username);
        if (board.createdBy !== foundUser._id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const indexOfMember = board.members.indexOf(memberId);
        if (indexOfMember !== -1) {
            board.members.splice(indexOfMember, 1);
            await board.save();
        } else {
            return res.status(404).json({ error: 'Member not found in the board' });
        }

        res.status(200).json({ msg: 'Member removed from the board successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getBoards,
    createBoard,
    getBoard,
    updateBoard,
    updateTitle,
    removeMemberFromBoard,
};
