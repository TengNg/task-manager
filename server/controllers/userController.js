const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const { createAuthTokens, sendAuthCookies } = require('../services/createAuthTokensService');
const { usernameRegex } = require('../data/regex');

const getUserInfo = async (req, res) => {
    const { username } = req.user;
    const user = await User.findOne({ username });
    res.json({ user });
}

const updateUsername = async (req, res) => {
    const { username } = req.user;
    const { newUsername } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(403).json({ msg: "user not found" });

    const foundUser = await User.findOne({ username: newUsername })
    if (foundUser) return res.status(409).json({ msg: "Username is already exists" }); // Conflict

    if (!usernameRegex.test(newUsername)) return res.status(400).json({ msg: "Username not valid" });

    user.username = newUsername;
    await user.save();

    const { accessToken, refreshToken } = createAuthTokens(user);
    sendAuthCookies(res, null, refreshToken);

    res.status(200).json({ msg: "Username updated", accessToken });
}

const updatePassword = async (req, res) => {
    const { username } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) return res.status(200).json({ notice: 'PLEASE_PROVIDE_NEW_PASSWORD', msg: 'Please provide new password' })

    const foundUser = await User.findOne({ username });
    if (!foundUser) return res.status(401).json({ msg: "Unauthorized" });

    if (foundUser.discordId) return res.status(400).json({ msg: "Cannot change password" });

    const validPwd = await bcrypt.compare(currentPassword, foundUser.password);
    if (!validPwd) return res.status(400).json({ msg: "Password is incorrect" });

    if (newPassword === currentPassword) return res.status(200).json({ notice: 'PASSWORD_NOT_CHANGED', msg: "New password is the same as current password" });

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
