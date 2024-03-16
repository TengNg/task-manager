const mongoose = require('mongoose');
const List = require('../models/List.js');
const Card = require('../models/Card.js');
const Board = require('../models/Board.js');
const { lexorank } = require('../lib/lexorank.js');

const getListCount = async (req, res) => {
    const { boardId } = req.params;

    const foundBoard = await Board.findById(boardId);
    if (!foundBoard) {
        return res.status(403).json({ msg: 'board not found' });
    }

    const count = await List.countDocuments({ boardId });
    return res.status(200).json({ count });
};

const addList = async (req, res) => {
    const { title, order, boardId } = req.body;

    const newList = new List({
        title,
        order,
        boardId,
    });

    await newList.save();
    return res.status(201).json({ msg: 'new list created', newList });
}

const updateLists = async (req, res) => {
    const { lists } = req.body;

    const bulkOps = lists.map(({ _id, order: _, title }, index) => ({
        updateOne: {
            filter: { _id },
            update: { $set: { order: index, title } },
        },
    }));

    await List.bulkWrite(bulkOps);

    res.status(200).json({ message: 'all lists updated' });
};

const reorder = async (req, res) => {
    const { id } = req.params;
    const { rank } = req.body;
    const newList = await List.findOneAndUpdate({ _id: id }, { order: rank }, { new: true });
    res.status(200).json({ message: 'list updated', newList });
};

const updateTitle = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const newList = await List.findOneAndUpdate({ _id: id }, { title }, { new: true });
    res.status(200).json({ message: 'list updated', newList });
};

const deleteList = async (req, res) => {
    const { id } = req.params;
    await List.findByIdAndDelete(id);
    await Card.deleteMany({ listId: id });
    res.status(200).json({ message: 'list deleted' });
};

const copyList = async (req, res) => {
    const { id } = req.params;
    const { rank } = req.body;

    const foundList = await List.findById(id);

    if (!foundList) {
        return res.status(403).json({ msg: "List not found" });
    }

    const { title, boardId } = foundList;
    const newListId = new mongoose.Types.ObjectId();

    const newList = new List({
        _id: newListId,
        title,
        order: rank,
        boardId,
    });

    try {
        const list = await newList.save();

        const copiedCards = await Card.find({ listId: id });
        for (const card of copiedCards) {
            const { title, description, order, highlight } = card;
            const newCard = new Card({
                title,
                description,
                order,
                highlight,
                listId: list._id
            });

            await newCard.save();
        }

        const cards = await Card.find({ listId: list._id }).sort({ order: 'asc' });

        res.status(200).json({ list, cards, message: 'list copied' });
    } catch (err) {
        console.error("Error saving document:", err);
    }
};

const moveList = async (req, res) => {
    const { id, boardId, index } = req.params;

    const foundList = await List.findById(id);
    if (!foundList) {
        return res.status(403).json({ msg: "List not found" });
    }

    const foundBoard = await Board.findById(boardId);
    if (!foundBoard) {
        return res.status(403).json({ msg: "Board not found" });
    }

    const sortedLists = await List.find({ boardId }).sort({ order: 'asc' });
    const [newOrder, ok] = lexorank.insert(sortedLists[index - 1]?.order, sortedLists[index]?.order);

    if (!ok) {
        return res.status(403).send('Bad Request');
    }

    const newList = await List.findByIdAndUpdate(id, { boardId, order: newOrder }, { new: true });

    await Card.updateMany({ listId: id }, { boardId });
    const newCards = await Card.find({ listId: id, boardId }).sort({ order: 'asc' });

    return res.status(200).json({ list: newList, cards: newCards });
};

module.exports = {
    getListCount,
    addList,
    updateLists,
    updateTitle,
    deleteList,
    copyList,
    reorder,
    moveList,
};
