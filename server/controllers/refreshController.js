const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { rTokenName, createAccessToken } = require('../services/createAuthTokensService');
const { sanitizeUser } = require('../services/userService');

const handleRefresh = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies || !cookies[rTokenName]) return res.sendStatus(401);

    const refreshToken = cookies[rTokenName];

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        async (err, decoded) => {
            if (err) return res.sendStatus(403);

            const { username, refreshTokenVersion } = decoded;

            const foundUser = await User.findOne({ username });
            if (!foundUser || foundUser.refreshTokenVersion !== refreshTokenVersion) {
                return res.sendStatus(401);
            }

            const accessToken = createAccessToken(foundUser);
            const user = sanitizeUser(foundUser.toObject());

            res.json({ user, accessToken })
        }
    );
}

module.exports = { handleRefresh }
