const jwt = require("jsonwebtoken")
const access_secret_key = process.env.ACCESS_SECRET_KEY
const refresh_secret_key = process.env.REFRESH_SECRET_KEY

const generateAccessToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email_id,
        type: user.userType,
    };
    // Changed from '1m' to '24h' - 1 minute expiry was causing immediate token expiration in production
    return jwt.sign(payload, access_secret_key, { expiresIn: '24h' });
};

const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email_id,
        type: user.userType,
    };

    return jwt.sign(payload, refresh_secret_key, { expiresIn: '7d' });
};

module.exports = { generateAccessToken, generateRefreshToken }