const jwt = require("jsonwebtoken");
const db = require("../../../config/config");
const User = db.user;
const generateToken = require("../../services/generateToken");
const refresh_secret_key = process.env.REFRESH_SECRET_KEY;

exports.refresh_token = async (req, res) => {
    // Get the refresh token from the custom header
    const refreshToken = req.headers['x-refresh-token'];
     
    // If the refresh token is missing
    if (!refreshToken) {
        return res.status(401).json({ message: 'Access token expired, refresh token not found' });
    }

    try {
        // Verify the refresh token
        const decodedRefreshToken = jwt.verify(refreshToken, refresh_secret_key);
        // Find the user based on the decoded refresh token
        const user = await User.findOne({ where: { id: decodedRefreshToken.id } });

        if (!user || !decodedRefreshToken) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        // Check if the refresh token has expired
        if (Date.now() > user.refreshToken_Expiration) {
            return res.status(403).json({ message: "Please login" });
        }

        // Generate a new access token
        const access_token_new = generateToken.generateAccessToken(user);
        // Respond with the new access token
        return res.status(200).json({ access_token: access_token_new });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
