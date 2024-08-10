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

    return {
        _id,
        username,
        createdAt,
        recentlyViewedBoardId,
        pinnedBoardIdCollection,
        loginWithDiscord: !!discordId,
    };
};

module.exports = {
   userByUsername,
   sanitizeUser,
};
