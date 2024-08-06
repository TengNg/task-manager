const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { rTokenName, clearAuthCookies, createAccessToken } = require('../services/createAuthTokensService');
const { sanitizeUser } = require('../services/userService');

const handleRefresh = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies || !cookies[rTokenName]) return res.status(401).json({ msg: "currently not logged in" });

    const refreshToken = cookies[rTokenName];

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        async (err, decoded) => {
            if (err) return res.sendStatus(403);

            const { username, refreshTokenVersion } = decoded;

            const foundUser = await User.findOne({ username });
            if (!foundUser) {
                return res.status(500).json({ msg: "user not found" });
            }

            if (foundUser.refreshTokenVersion !== refreshTokenVersion) {
                clearAuthCookies(res);
                return res.sendStatus(403);
            }

            const accessToken = createAccessToken(foundUser);
            const user = sanitizeUser(foundUser.toObject());

            res.json({ user, accessToken })
        }
    );
}

module.exports = { handleRefresh }
