const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { rTokenName, createAccessToken, sendAuthCookies } = require('../services/createAuthTokensService');
const { sanitizeUser } = require('../services/userService');

const handleRefresh = async (req, res) => {
    const cookies = req.cookies;
    const refreshToken = cookies[rTokenName];

    if (!refreshToken) return res.sendStatus(401);

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
            sendAuthCookies(res, null, { accessToken });

            const user = sanitizeUser(foundUser.toObject());
            res.json({ user })
        }
    );
}

module.exports = { handleRefresh }
