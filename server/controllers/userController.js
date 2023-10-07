const User = require('../models/User.js');

const getUserInfo = async (req, res) => {
    const { username } = req.user;
    const user = await User.findOne({ username });
    res.json({ user });
}

const updateUsername = async (req, res) => {
    const { username } = req.user;
    const { newUsername } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ msg: "Unauthorized" });

    const foundUser = await User.findOne({ username: newUsername })
    if (foundUser) return res.status(409).json({ msg: "Username is already exists" }); // Conflict

    user.username = newUsername;
    await user.save();
    return res.status(200).json({ msg: "Username updated", user });
}

module.exports = {
    getUserInfo,
    updateUsername,
}
