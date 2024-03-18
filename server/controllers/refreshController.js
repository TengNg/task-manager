require('dotenv').config();
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

const handleRefresh = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.token) return res.status(401).json({ msg: "currently not logged in" });
    const refreshToken = cookies.token;

    const foundUser = await User.findOne({ refreshToken }).select('-password -refreshToken');

    if (!foundUser) return res.status(500).json({ msg: "user not found" });

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        (err, decoded) => {
            if (err || foundUser.username !== decoded.username) {
                return res.sendStatus(403);
            }
            const accessToken = jwt.sign(
                { "username": decoded.username },
                process.env.ACCESS_TOKEN,
                { expiresIn: '600s' }
            );
            res.json({ user: foundUser, accessToken })
        }
    );
}

module.exports = { handleRefresh }
