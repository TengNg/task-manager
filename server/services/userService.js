const User = require('../models/User');

const userByUsername = (username, option = { lean: true }) => {
    const foundUser = User.findOne({ username });
    if (option.lean) foundUser.lean();
    return foundUser;
};

module.exports = {
   userByUsername
};
