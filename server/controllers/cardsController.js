const Card = require('../models/Card.js');

const addCard = async (req, res) => {
    const { title, description = "", order, listId } = req.body;

    const newCard = new Card({
        title,
        description,
        order,
        listId
    });

    await newCard.save();
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

module.exports = {
    addCard,
    updateCard,
    updateTitle,
    updateDescription,
    updateHighlight,
    reorder,
}
