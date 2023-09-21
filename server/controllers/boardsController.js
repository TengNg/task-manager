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

    const boards = await Board.find({ createBy: foundUser._id });
    return res.json(boards);
};

const getBoard = async (req, res) => {
    const { id } = req.params;
    const board = await Board.findOne({ _id: id });
    const lists = await List.find({ boardId: id });

    const listsWithCards = lists.map(async (list) => {
        const cards = await Card.find({ listId: list._id })
        return {
            ...list.toObject(),
            cards
        }
    })

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

module.exports = {
    getBoards,
    createBoard,
    getBoard,
};
