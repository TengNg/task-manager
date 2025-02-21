const jwt = require('jsonwebtoken');

const cookieOpts = {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000
};

const rTokenName = 'tamagostart_rtoken';

/**
 * @param {User} user
 */
const createAccessToken = (user) => {
    const { _id: userId, username } = user;
    const accessToken = jwt.sign(
        { userId, username },
        process.env.ACCESS_TOKEN,
        { expiresIn: '15min' }
    );
    return accessToken;
};

/**
 * @param {User} user
 */
const createRefreshToken = (user) => {
    const { _id: userId, username, refreshTokenVersion } = user;
    const refreshToken = jwt.sign(
        { userId, username, refreshTokenVersion },
        process.env.REFRESH_TOKEN,
        { expiresIn: '15d' }
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
    res.clearCookie(rTokenName, cookieOpts);
};

module.exports = {
    rTokenName,
    cookieOpts,
    createAccessToken,
    createRefreshToken,
    createAuthTokens,
    sendAuthCookies,
    clearAuthCookies,
}
