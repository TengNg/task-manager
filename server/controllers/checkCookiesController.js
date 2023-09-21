const isLoggedIn = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.token) return res.status(401).json({ msg: "error" });
    return res.status(200).json({ msg: "user is logged in" });
};

module.exports = { isLoggedIn }
