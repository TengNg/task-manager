require('dotenv').config();

const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const handleLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) res.status(400).json({ msg: "Username and password are required" });

    const foundUser = await User.findOne({ username }).lean();
    if (!foundUser) return res.status(401).json({ msg: "Unauthorized" });

    const validPwd = await bcrypt.compare(password, foundUser.password);
    if (!validPwd) return res.status(400).json({ msg: "Password is incorrect" });

    const accessToken = jwt.sign(
        { "username": foundUser.username },
        process.env.ACCESS_TOKEN,
        { expiresIn: '600s' }
    );

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN,
        { expiresIn: '1d' }
    );

    const currentUser = await User.findOneAndUpdate({ username }, { refreshToken }, { new: true }).select('-password -refreshToken');

    res.cookie(
        'token',
        refreshToken,
        {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    );

    // const userData = {
    //     profileImage: currentUser.profileImage,
    //     username: currentUser.username,
    // };

    return res.status(200).json({
        user: currentUser,
        accessToken,
        refreshToken,
    });
};

module.exports = { handleLogin };
