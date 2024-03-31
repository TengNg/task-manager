const Card = require('../models/Card.js');
const User = require('../models/User.js');
const Board = require('../models/Board.js');
const List = require('../models/List.js');
const mongoose = require('mongoose');

const addCard = async (req, res) => {
    const { title, order, listId } = req.body;

    const newCard = new Card({
        title,
        order,
        listId
    });

    await newCard.save();
    List.findOneAndUpdate({ _id: listId }, { $inc: { cardCount: 1 } }, { new: true });

    return res.status(201).json({ msg: 'new card added', newCard });
};

const updateCard = async (req, res) => {
    const { id } = req.params;
    const { title, description, order, listId } = req.body;
    const newCard = await Card.findOneAndUpdate({ _id: id }, { title, description, order, listId }, { new: true });
    return res.status(200).json({ msg: 'new card updated', newCard });
};

const reorder = async (req, res) => {
    const { id } = req.params;
    const { rank, listId } = req.body;
    const newCard = await Card.findOneAndUpdate({ _id: id }, { order: rank, listId }, { new: true });
    res.status(200).json({ message: 'card updated', newCard });
};

const updateTitle = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const newCard = await Card.findOneAndUpdate({ _id: id }, { title }, { new: true });
    res.status(200).json({ message: 'card updated', newCard });
};

const updateDescription = async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    const newCard = await Card.findOneAndUpdate({ _id: id }, { description }, { new: true });
    res.status(200).json({ message: 'card updated', newCard });
};

const updateHighlight = async (req, res) => {
    const { id } = req.params;
    const { highlight } = req.body;
    const newCard = await Card.findOneAndUpdate({ _id: id }, { highlight }, { new: true });
    res.status(200).json({ message: 'card updated', newCard });
};

const deleteCard = async (req, res) => {
    const { id } = req.params;
    const removed = await Card.findOneAndDelete({ _id: id });

    if (!removed) {
        return res.status(404).json({ error: 'Card not found' });
    }

    res.status(200).json({ message: 'Card removed successfully' });
};

const copyCard = async (req, res) => {
    const { id } = req.params;
    const { rank } = req.body;

    const foundCard = await Card.findById(id);

    if (!foundCard) {
        return res.status(404).json({ error: 'Card not found' });
    }

    const {
        title,
        description,
        listId,
        highlight,
        owner,
    } = foundCard;

    const newCard = new Card({
        _id: new mongoose.Types.ObjectId(),
        order: rank,
        title,
        description,
        listId,
        owner,
        highlight,
    });

    newCard.save();

    res.status(200).json({ msg: 'Card copied successfully', newCard });
};

const updateOwner = async (req, res) => {
    const { username } = req.user;
    const { id } = req.params;
    const { ownerName } = req.body;

    const foundUser = await User.findOne({ username }).lean();
    if (!foundUser) return res.status(403).json({ msg: "User not found" });

    if (!ownerName) {
        const result = await Card.findByIdAndUpdate(
            id, { $set: { owner: null } }, { new: true }
        );

        return res.status(200).json({ msg: 'Update member successfully', newCard: result });
    }

    const foundMember = await User.findOne({ username: ownerName }).lean();
    if (!foundMember) return res.status(403).json({ msg: "Member not found" });

    const result = await Card.findByIdAndUpdate(
        id, { $set: { owner: foundMember.username } }, { new: true }
    );

    res.status(200).json({ msg: 'Update member successfully', newCard: result });
};

module.exports = {
    addCard,
    updateCard,
    updateTitle,
    updateDescription,
    updateHighlight,
    deleteCard,
    reorder,
    copyCard,
    updateOwner,
}
