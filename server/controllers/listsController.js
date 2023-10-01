const List = require('../models/List.js');
const Card = require('../models/Card.js');

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

const updateListsCards = async (req, res) => {
    const { lists } = req.body;
    lists.map((list, _) => {
        const newCards = list.cards;
        newCards.map(async ({ _id, listId, title }, index) => {
            await Card.findOneAndUpdate({ _id: _id }, { order: index, title, listId });
        });
    });

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

module.exports = {
    addList,
    updateLists,
    updateListsCards,
    updateTitle,
    reorder,
}
