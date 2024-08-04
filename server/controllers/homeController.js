const User = require('../models/User.js');

const getUserInfo = async (req, res) => {
    const { username } = req.user;
    const user = await User.findOne({ username }).select('-password -refreshTokenVersion');
    res.json({ user });
}

module.exports = { getUserInfo }
