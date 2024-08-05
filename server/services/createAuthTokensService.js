const jwt = require('jsonwebtoken');

const cookieOpts = {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    maxAge: 24 * 60 * 60 * 1000
};

const rTokenName = 'token';

/**
 * @param {User} user
 */
const createAccessToken = (user) => {
    const { username } = user;
    const accessToken = jwt.sign(
        { username },
        process.env.ACCESS_TOKEN,
        { expiresIn: '300s' }
    );
    return accessToken;
};

/**
 * @param {User} user
 */
const createRefreshToken = (user) => {
    const { username, refreshTokenVersion } = user;
    const refreshToken = jwt.sign(
        { username, refreshTokenVersion },
        process.env.REFRESH_TOKEN,
        { expiresIn: '24h' }
    );
    return refreshToken;
};

/**
 * @param {User} user
 */
const createAuthTokens = (user) => {
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    return { accessToken, refreshToken };
};

/**
 * @param {Response} res
 * @param {User} user
 * @param {JWTToken} rToken
 */
const sendAuthCookies = (res, user, rToken = null) => {
    if (rToken) {
        res.cookie(rTokenName, rToken, cookieOpts);
        return;
    }

    const refreshToken = createRefreshToken(user);
    res.cookie(rTokenName, refreshToken, cookieOpts);
};

/**
 * @param {Response} res
 */
const clearAuthCookies = (res) => {
    res.clearCookie('token', cookieOpts);
};

module.exports = {
    createAccessToken,
    createRefreshToken,
    createAuthTokens,
    sendAuthCookies,
    clearAuthCookies,
}
