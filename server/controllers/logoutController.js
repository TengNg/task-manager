const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

const { clearAuthCookies } = require('../services/createAuthTokensService');

const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.token) return res.sendStatus(204);

    clearAuthCookies(res);

    res.sendStatus(204);
}

const handleLogoutOfAllDevices = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.token) return res.sendStatus(204);

    const refreshToken = cookies.token;
    const data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

    await User.findOneAndUpdate(
        { username: data.username },
        { $inc: { refreshTokenVersion: 1 } }
    );

    clearAuthCookies(res);

    res.sendStatus(204);
}

module.exports = {
    handleLogout,
    handleLogoutOfAllDevices,
}
