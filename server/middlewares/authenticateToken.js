require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ msg: "Unauthorized" });

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.status(403).json({ msg: "no access token" });
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
