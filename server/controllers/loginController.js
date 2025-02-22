const User = require('../models/User');
const bcrypt = require('bcryptjs');

const { createAuthTokens, sendAuthCookies } = require('../services/createAuthTokensService');
const { sanitizeUser } = require('../services/userService');

const handleLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) res.status(400).json({ msg: "Username and Password are required" });

    const foundUser = await User.findOne({ username });
    if (!foundUser) return res.status(401).json({ msg: "Unauthorized" });

    const validPwd = await bcrypt.compare(password, foundUser.password);
    if (!validPwd) return res.status(400).json({ msg: "Password is incorrect" });

    const { accessToken, refreshToken } = createAuthTokens(foundUser);
    sendAuthCookies(res, null, refreshToken);

    const user = sanitizeUser(foundUser.toObject());

    return res.status(200).json({
        user,
        accessToken,
        refreshToken,
    });
};

module.exports = { handleLogin };
