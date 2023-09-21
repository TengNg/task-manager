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

module.exports = { addList }
