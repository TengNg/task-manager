const User = require("../models/User.js");
const jwt = require('jsonwebtoken');

const { rTokenName, clearAuthCookies } = require('../services/createAuthTokensService');

const isLoggedIn = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies || !cookies[rTokenName]) {
        return res.status(401).json({ msg: "currently not logged in" });
    }

    const data = jwt.verify(cookies.token, process.env.REFRESH_TOKEN);
    const { username, refreshTokenVersion } = data;

    const foundUser = await User.findOne({ username });
    if (!foundUser) {
        return res.status(500).json({ msg: "user not found" });
    }

    if (refreshTokenVersion !== foundUser.refreshTokenVersion) {
        clearAuthCookies(res);
    }

    return res.status(200).json({ msg: "user is logged in" });
};

module.exports = { isLoggedIn }
