const List = require('../models/List.js');

const addList = async (req, res) => {
    const { title, order, boardId } = req.body;

    const newList = new List({
        title,
        order,
        boardId
    });

    await newList.save();
    return res.status(201).json({ msg: 'new list created', newList });
}

const updateLists = async (req, res) => {
    const { lists } = req.body;

    const bulkOps = lists.map(({ _id, order }, index) => ({
        updateOne: {
            filter: { _id },
            update: { $set: { order: index } },
        },
    }));

    await List.bulkWrite(bulkOps);

    res.status(200).json({ message: 'List order updated successfully' });
};

module.exports = {
    addList,
    updateLists
}
