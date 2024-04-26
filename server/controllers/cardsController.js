const Card = require('../models/Card.js');
const List = require('../models/List.js');
const mongoose = require('mongoose');

const { isActionAuthorized } = require('../services/boardActionAuthorizeService');
const { userByUsername } = require('../services/userService');

const listById = (id, option = { lean: true }) => {
    const foundList = List.findById(id);
    if (option.lean) foundList.lean();
    return foundList;
};

const cardById = (id, option = { lean: true }) => {
    const foundCard = Card.findById(id);
    if (option.lean) foundCard.lean();
    return foundCard;
};

const getCard = async (req, res) => {
    const { username } = req.user;
    const { id } = req.params;

    const foundUser = await userByUsername(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const foundCard = await cardById(id);
    if (!foundCard) return res.status(403).json({ msg: "card not found" });

    return res.status(201).json({ card: foundCard });
};

const addCard = async (req, res) => {
    const { trackedId, title, order, listId } = req.body;

    const foundList = await listById(listId);
    if (!foundList) return res.status(403).json({ msg: "list not found" });

    const { boardId } = foundList;
    const { authorized } = await isActionAuthorized(boardId, req.user.username);
    if (!authorized) return res.status(403).json({ msg: 'unauthorized' });

    const newCard = new Card({
        trackedId,
        title,
        order,
        listId,
        boardId,
    });

    await newCard.save();
    return res.status(201).json({ msg: 'new card added', newCard });
};

const reorder = async (req, res) => {
    const { id } = req.params;
    const { rank, listId } = req.body;

    const foundCard = await cardById(id, { lean: false });
    if (!foundCard) return res.status(404).json({ error: 'Card not found' });

    const foundList = await listById(listId);
    if (!foundList) return res.status(404).json({ error: 'List not found' });

    const { boardId } = foundList;
    const { authorized } = await isActionAuthorized(boardId, req.user.username);
    if (!authorized) return res.status(403).json({ msg: 'unauthorized' });

    foundCard.rank = rank;
    foundCard.listId = listId;
    await foundCard.save();

    res.status(200).json({ message: 'card updated', newCard: foundCard });
};

const updateTitle = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const foundCard = await cardById(id, { lean: false });
    if (!foundCard) return res.status(404).json({ error: 'Card not found' });

    const { boardId } = foundCard;
    const { authorized } = await isActionAuthorized(boardId, req.user.username);
    if (!authorized) return res.status(403).json({ msg: 'unauthorized' });

    foundCard.title = title;
    await foundCard.save();

    res.status(200).json({ message: 'card updated', newCard: foundCard });
};

const updateDescription = async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;

    const foundCard = await cardById(id, { lean: false });
    if (!foundCard) return res.status(404).json({ error: 'Card not found' });

    const { boardId } = foundCard;
    const { authorized } = await isActionAuthorized(boardId, req.user.username);
    if (!authorized) return res.status(403).json({ msg: 'unauthorized' });

    foundCard.description = description;
    await foundCard.save();

    res.status(200).json({ message: 'card updated', newCard: foundCard });
};

const updateHighlight = async (req, res) => {
    const { id } = req.params;
    const { highlight } = req.body;

    const foundCard = await cardById(id, { lean: false });
    if (!foundCard) return res.status(404).json({ error: 'Card not found' });

    const { boardId } = foundCard;
    const { authorized } = await isActionAuthorized(boardId, req.user.username);
    if (!authorized) return res.status(403).json({ msg: 'unauthorized' });

    foundCard.highlight = highlight;
    await foundCard.save();

    res.status(200).json({ message: 'card updated', newCard: foundCard });
};

const deleteCard = async (req, res) => {
    const { id } = req.params;

    const foundCard = await cardById(id, { lean: false });
    if (!foundCard) return res.status(404).json({ error: 'Card not found' });

    const { boardId } = foundCard;
    const { authorized } = await isActionAuthorized(boardId, req.user.username);
    if (!authorized) return res.status(403).json({ msg: 'unauthorized' });

    await Card.findOneAndDelete({ _id: id });

    res.status(200).json({ message: 'Card removed successfully' });
};

const copyCard = async (req, res) => {
    const { id } = req.params;
    const { rank } = req.body;

    const foundCard = await cardById(id, { lean: true });
    if (!foundCard) return res.status(404).json({ error: 'Card not found' });

    const { boardId } = foundCard;
    const { authorized } = await isActionAuthorized(boardId, req.user.username);
    if (!authorized) return res.status(403).json({ msg: 'unauthorized' });

    const newCard = new Card({
        ...foundCard, _id: new mongoose.Types.ObjectId(), rank
    });

    await newCard.save();

    res.status(200).json({ msg: 'Card copied successfully', newCard: newCard });
};

const updateOwner = async (req, res) => {
    const { username } = req.user;
    const { id } = req.params;
    const { ownerName } = req.body;

    const foundCard = await cardById(id, { lean: false });
    if (!foundCard) return res.status(404).json({ error: 'Card not found' });

    const { boardId } = foundCard;
    const { authorized } = await isActionAuthorized(boardId, username);
    if (!authorized) return res.status(403).json({ msg: 'unauthorized' });

    foundCard.owner = ownerName;
    await foundCard.save();

    res.status(200).json({ msg: 'Update member successfully', newCard: foundCard });
};

module.exports = {
    getCard,
    addCard,
    updateTitle,
    updateDescription,
    updateHighlight,
    deleteCard,
    reorder,
    copyCard,
    updateOwner,
}
