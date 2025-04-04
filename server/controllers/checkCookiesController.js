const User = require("../models/User.js");
const jwt = require('jsonwebtoken');

const { rTokenName, clearAuthCookies } = require('../services/createAuthTokensService');

const isLoggedIn = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies || !cookies[rTokenName]) {
        return res.status(401).json({ msg: "currently not logged in" });
    }

    const refreshToken = cookies[rTokenName];

    const data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const { userId,refreshTokenVersion } = data;

    const foundUser = await User.findById(userId);
    if (!foundUser) {
        return res.status(500).json({ msg: "user not found" });
    }

    if (refreshTokenVersion !== foundUser.refreshTokenVersion) {
        clearAuthCookies(res);
        return res.status(401).json({ msg: "currently not logged in" });
    }

    return res.status(200).json({ msg: "user is logged in" });
};

module.exports = { isLoggedIn }
