const crypto = require('crypto');

const generateRandomHex = (length) => {
    return crypto.randomBytes(Math.round(length / 2)).toString('hex');
};

module.exports = { generateRandomHex };

