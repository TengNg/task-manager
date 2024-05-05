const User = require("../models/User.js");

const isLoggedIn = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.token) {
        return res.status(401).json({ msg: "currently not logged in" });
    }

    const foundUser = await User.findOne({ refreshToken: cookies.token })
    if (!foundUser) return res.status(500).json({ msg: "user not found" });

    return res.status(200).json({ msg: "user is logged in" });
};

module.exports = { isLoggedIn }
