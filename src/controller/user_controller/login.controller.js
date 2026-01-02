const db = require("../../../config/config");
const User = db.user;
const Department = db.department;
const bcrypt = require("bcryptjs");
const tokenProcess = require("../../services/generateToken");
const pool = require("../../utils/mysql2Connection");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trimmed fields
        const trimmedEmail = email ? email.trim() : '';
        const trimmedPassword = password ? password.trim() : '';

        // Simple validation
        if (!trimmedEmail || !trimmedPassword) {
            return res.status(400).json({
                status: false,
                message: "Please provide both email and password",
            });
        }

        const users = await User.findOne({ where: { email_id: trimmedEmail } });
        if (users==null) {
            const departmentUser = await Department.findOne({ where: { email_id: trimmedEmail } });
            if (!departmentUser) {
                return res.status(401).json({
                    status: false,
                    message: "Login failed, please check the email address .",
                });
            }
            const find_pass = departmentUser.password

            const isPasswordValid = await bcrypt.compare(trimmedPassword, find_pass);
            if (!isPasswordValid) {
                return res.status(401).json({
                    status: false,
                    message: "Please enter valide password ",
                });
            }
            const access_token = tokenProcess.generateAccessToken(departmentUser);
            const refresh_token = tokenProcess.generateRefreshToken(departmentUser);
            const refreshTokenExpiration = Date.now() + 2 * 24 * 60 * 60 * 1000;

            departmentUser.refreshToken = refresh_token;
            departmentUser.refreshToken_Expiration = refreshTokenExpiration;
            await departmentUser.save();
            return res.status(200).json({
                status: true,
                message: "Login successful",
                access_token: access_token,
                refresh_token: refresh_token,
                userType:departmentUser.userType,
                permissions:departmentUser.permissions,
                adminId : departmentUser.userId,
                departmentUserId: departmentUser.id,
                userId:departmentUser.id
            });
    

        }
        const find_pass = users.password

        const isPasswordValid = await bcrypt.compare(trimmedPassword, find_pass);

        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                message: "Please enter valide password ",
            });
        }

        // Check if user is active
        if (users.is_active === false) {
            return res.status(403).json({
                status: false,
                message: "Your account has been deactivated. Please contact administrator.",
            });
        }

        // SuperAdmin never needs license - allow login
        if (users.userType === 'superadmin') {
            const access_token = tokenProcess.generateAccessToken(users);
            const refresh_token = tokenProcess.generateRefreshToken(users);
            const refreshTokenExpiration = Date.now() + 2 * 24 * 60 * 60 * 1000;

            users.refreshToken = refresh_token;
            users.refreshToken_Expiration = refreshTokenExpiration;
            await users.save();

            return res.status(200).json({
                status: true,
                message: "Login successful",
                access_token: access_token,
                refresh_token: refresh_token,
                userType: users.userType,
                userId: users.id
            });
        }

        // Admin users must have valid license
        if (users.userType === 'admin') {
            let connection;
            try {
                connection = await pool.getConnection();
                
                // Check for active license linked to this admin
                const [licenses] = await connection.execute(
                    `SELECT * FROM licenses 
                     WHERE admin_id = ? 
                     AND is_active = TRUE 
                     AND (expiry_date IS NULL OR expiry_date > NOW())`,
                    [users.id]
                );

                if (licenses.length === 0) {
                    // Check if license exists but expired
                    const [expiredLicenses] = await connection.execute(
                        `SELECT * FROM licenses 
                         WHERE admin_id = ?`,
                        [users.id]
                    );

                    if (expiredLicenses.length > 0) {
                        const license = expiredLicenses[0];
                        if (license.expiry_date && new Date(license.expiry_date) <= new Date()) {
                            return res.status(403).json({
                                status: false,
                                message: "Your license has expired. Please contact administrator for renewal.",
                                licenseExpired: true
                            });
                        }
                        if (!license.is_active) {
                            return res.status(403).json({
                                status: false,
                                message: "Your license is inactive. Please contact administrator.",
                                licenseInactive: true
                            });
                        }
                    }

                    return res.status(403).json({
                        status: false,
                        message: "Valid license required. Please contact administrator.",
                        requiresLicense: true
                    });
                }

                // License is valid, proceed with login
                // Set flag to indicate license is assigned (for frontend routing)
                const licenseAssigned = licenses.length > 0;
                
                const access_token = tokenProcess.generateAccessToken(users);
                const refresh_token = tokenProcess.generateRefreshToken(users);
                const refreshTokenExpiration = Date.now() + 2 * 24 * 60 * 60 * 1000;

                users.refreshToken = refresh_token;
                users.refreshToken_Expiration = refreshTokenExpiration;
                await users.save();

                return res.status(200).json({
                    status: true,
                    message: "Login successful",
                    access_token: access_token,
                    refresh_token: refresh_token,
                    userType: users.userType,
                    userId: users.id,
                    licenseAssigned: licenseAssigned
                });
            } catch (error) {
                console.error("License check error:", error);
                return res.status(500).json({
                    status: false,
                    message: "An error occurred during license validation",
                });
            } finally {
                if (connection) connection.release();
            }
        }

        const access_token = tokenProcess.generateAccessToken(users);
        const refresh_token = tokenProcess.generateRefreshToken(users);
        const refreshTokenExpiration = Date.now() + 2 * 24 * 60 * 60 * 1000;

        users.refreshToken = refresh_token;
        users.refreshToken_Expiration = refreshTokenExpiration;
        await users.save();

        return res.status(200).json({
            status: true,
            message: "Login successful",
            access_token: access_token,
            refresh_token: refresh_token,
            userType: users.userType,
            userId: users.id
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred during the login process",
        });
    }
};
