const User = require('../models/User.js');

const bcrypt = require('bcrypt');

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
    return res.status(200).json({ msg: "Username updated" });
}

const updatePassword = async (req, res) => {
    const { username } = req.user;
    const { currentPassword, newPassword } = req.body;

    const foundUser = await User.findOne({ username });
    if (!foundUser) return res.status(401).json({ msg: "Unauthorized" });

    const validPwd = await bcrypt.compare(currentPassword, foundUser.password);
    if (!validPwd) return res.status(400).json({ msg: "Password is incorrect" });

    const hashedPwd = await bcrypt.hash(newPassword, 10);
    foundUser.password = hashedPwd;
    await foundUser.save();
    return res.status(200).json({ msg: "Password changed" });
};

module.exports = {
    getUserInfo,
    updateUsername,
    updatePassword,
}
