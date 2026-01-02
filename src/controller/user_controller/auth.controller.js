const db = require("../../../config/config");
const { user } = db;
const bcrypt = require('bcrypt');
const { sendEmail } = require('../../utils/mailService');
const { generateToken, verifyToken } = require('../../utils/jwtService');

const forgetPassword = async (req, res) => {
    try {
        const { email_id } = req.body;

        const userRecord = await user.findOne({ where: { email_id } });

        if (!userRecord) {
            return res.status(404).json({
                status: false,
                message: 'No account associated with this email',
            });
        }
        const resetTokenExpirationMs = parseInt(process.env.RESET_TOKEN_EXPIRATION_MS, 10);

        const token = generateToken({ email_id: userRecord.email_id }, `${resetTokenExpirationMs / 60000}m`); 
        userRecord.resetToken = token;
        userRecord.resetTokenExpiry = Date.now() + resetTokenExpirationMs;
        await userRecord.save();

        const resetUrl = `${process.env.FRONTEND_URL}/resetPassword?token=${token}`;

        const emailSent = await sendEmail(
            email_id,
            'Password Reset Request',
            `To reset your password, click the following link. It's valid for 2 minutes: ${resetUrl}`
        );

        if (!emailSent) {
            return res.status(500).json({
                status: false,
                message: 'Failed to send reset link, please try again',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Password reset link sent to email',
        });
    } catch (error) {
        console.error('Forget Password Error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const token = req.query.token;
        if (!newPassword) {
            return res.status(400).json({ status: false, message: 'Password is required' });
        }
        if (!token) {
            return res.status(400).json({ status: false, message: 'Token is missing' });
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            return res.status(400).json({ status: false, message: 'Invalid or expired token' });
        }

        const { email_id } = decoded;
        const userRecord = await user.findOne({ where: { email_id } });

        if (!userRecord || userRecord.resetToken !== token || userRecord.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ status: false, message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        userRecord.password = hashedPassword;
        userRecord.resetToken = null;
        userRecord.resetTokenExpiry = null;
        await userRecord.save();

        return res.status(200).json({ status: true, message: 'Password has been successfully reset' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Failed to reset password' });
    }
};

module.exports = { forgetPassword, resetPassword };
