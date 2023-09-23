const Card = require('../models/Card.js');

const addCard = async (req, res) => {
    const { title, description, order, listId } = req.body;

    const newCard = new Card({
        title,
        description,
        order,
        listId
    });

    await newCard.save();
    return res.status(201).json({ msg: 'new card added', newCard });
};

module.exports = { addCard }
