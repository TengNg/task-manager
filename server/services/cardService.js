const Card = require('../models/Card');

const cardById = (id, option = { lean: true }) => {
    const foundCard = Card.findById(id);
    if (option.lean) foundCard.lean();
    return foundCard;
};

module.exports = {
    cardById
}
