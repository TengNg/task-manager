const BoardActivity = require('../models/BoardActivity');

const saveBoardActivity = async ({ boardId, userId, listId, cardId, action, createdAt, description, type }) => {
    if (createdAt) createdAt = new Date();

    try {
        const newActivity = new BoardActivity({
            board: boardId,
            user: userId,
            card: cardId,
            list: listId,
            type,
            action,
            description,
            createdAt,
        });

        const savedActivity = await newActivity.save();
        return savedActivity;
    } catch (error) {
        console.log(error);
        return null;
    }
};

module.exports = saveBoardActivity;
