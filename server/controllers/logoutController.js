const User = require('../models/User.js');
const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.token) return res.sendStatus(204); // No content
    const refreshToken = cookies.token;

    const foundUser = await User.findOne({ refreshToken }).lean();
    if (!foundUser) {
        res.clearCookie('token', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    await User.findOneAndUpdate(
        { refreshToken: foundUser.refreshToken },
        { refreshToken: null },
        { new: true }
    );

    res.clearCookie('token', { httpOnly: true, sameSite: 'None', secure: true });
    res.status(204).json({ msg: "logout success" });
}

module.exports = { handleLogout }
