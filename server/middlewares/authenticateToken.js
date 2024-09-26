const jwt = require('jsonwebtoken');

const { aTokenName } = require('../services/createAuthTokensService');

const authenticateToken = (req, res, next) => {
    const cookies = req.cookies;
    const token = cookies[aTokenName];

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
