const jwt = require('jsonwebtoken');

const cookieOpts = {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000
};

const accessTokenCookieOpts = {
    ...cookieOpts,
    maxAge: 15 * 60 * 1000
};

const aTokenName = 'tamagostart_atoken';
const rTokenName = 'tamagostart_rtoken';

/**
 * @param {User} user
 */
const createAccessToken = (user) => {
    const { username } = user;
    const accessToken = jwt.sign(
        { username },
        process.env.ACCESS_TOKEN,
        { expiresIn: '15min' }
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
const sendAuthCookies = (res, user, tokens = {}) => {
    if (tokens.refreshToken || tokens.accessToken) {
        if (tokens.accessToken) {
            res.cookie(aTokenName, tokens.accessToken, accessTokenCookieOpts);
        }

        if (tokens.refreshToken) {
            res.cookie(rTokenName, tokens.refreshToken, cookieOpts);
        }

        return;
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.cookie(aTokenName, accessToken, accessTokenCookieOpts);
    res.cookie(rTokenName, refreshToken, cookieOpts);
};

/**
 * @param {Response} res
 */
const clearAuthCookies = (res) => {
    res.clearCookie(aTokenName, accessTokenCookieOpts);
    res.clearCookie(rTokenName, cookieOpts);
};

module.exports = {
    aTokenName,
    rTokenName,
    cookieOpts,
    createAccessToken,
    createRefreshToken,
    createAuthTokens,
    sendAuthCookies,
    clearAuthCookies,
}
