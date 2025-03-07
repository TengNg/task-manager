const User = require('../models/User');

const userByUsername = (username, option = { lean: true }) => {
    const foundUser = User.findOne({ username });
    if (option.lean) foundUser.lean();
    return foundUser;
};

const sanitizeUser = (user) => {
    const {
        _id,
        username,
        createdAt,
        recentlyViewedBoardId,
        pinnedBoardIdCollection,
        discordId,
    } = user;

    const data = {
        _id,
        username,
        createdAt,
        recentlyViewedBoardId,
        pinnedBoardIdCollection: pinnedBoardIdCollection ? Object.fromEntries(pinnedBoardIdCollection) : {},
        loginWithDiscord: !!discordId,
    }

    return data;
};

module.exports = {
    userByUsername,
    sanitizeUser,
};
