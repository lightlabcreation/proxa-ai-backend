// const db = require("../../../config/config");
// const User = db.user;
// const bcrypt = require("bcryptjs");
// const pool = require("../../utils/mysql2Connection");
// const jwt = require('jsonwebtoken');
// const accessSecretKey = process.env.ACCESS_SECRET_KEY;

// /**
//  * Generate a random license key in format: APP-XXXX-YYYY-ZZZZ
//  */
// function generateLicenseKey() {
//   const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
//   const generateSegment = () => {
//     let segment = '';
//     for (let i = 0; i < 4; i++) {
//       segment += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return segment;
//   };
//   return `APP-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
// }

// /**
//  * Check if user is SuperAdmin
//  * Uses req.user set by authenticate middleware
//  */
// function isSuperAdmin(req) {
//   try {
//     // Check req.user first (set by authenticate middleware)
//     if (req.user && req.user.userType === 'superadmin') {
//       return true;
//     }
    
//     // Fallback to token check if req.user not available
//     const authHeader = req.headers['authorization'];
//     if (!authHeader) return false;
    
//     const token = authHeader.split(' ')[1];
//     if (!token) return false;
    
//     const decoded = jwt.verify(token, accessSecretKey);
//     return decoded.type === 'superadmin';
//   } catch (error) {
//     return false;
//   }
// }

// /**
//  * Create notification
//  */
// async function createNotification(type, message, targetRole, targetUserId = null, licenseId = null) {
//   let connection;
//   try {
//     connection = await pool.getConnection();
//     await connection.execute(
//       `INSERT INTO notifications (type, message, target_role, target_user_id, related_license_id, created_at) 
//        VALUES (?, ?, ?, ?, ?, NOW())`,
//       [type, message, targetRole, targetUserId, licenseId]
//     );
//   } catch (error) {
//     console.error('Error creating notification:', error.message);
//   } finally {
//     if (connection) connection.release();
//   }
// }

// /**
//  * POST /api/superadmin/create-admin
//  * Create a new Admin user with license (SuperAdmin only)
//  */
// exports.createAdmin = async (req, res) => {
//   let connection = null;
//   try {
//     // Strict role check - must be SuperAdmin
//     if (!req.user || req.user.userType !== 'superadmin') {
//       return res.status(403).json({
//         status: false,
//         message: 'SuperAdmin access required'
//       });
//     }

//     const { email, password, startDate, expiryDate, licensePeriodDays } = req.body;

//     // Validate required fields
//     if (!email || !password) {
//       return res.status(400).json({
//         status: false,
//         message: 'Email and password are required'
//       });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ where: { email_id: email.trim() } });
//     if (existingUser) {
//       return res.status(400).json({
//         status: false,
//         message: 'User with this email already exists'
//       });
//     }

//     connection = await pool.getConnection();

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Calculate dates
//     const start = startDate ? new Date(startDate) : new Date();
//     let expiry = null;
    
//     if (expiryDate) {
//       expiry = new Date(expiryDate + 'T23:59:59');
//     } else if (licensePeriodDays) {
//       expiry = new Date(start);
//       expiry.setDate(expiry.getDate() + parseInt(licensePeriodDays));
//       expiry.setHours(23, 59, 59, 0);
//     }

//     // Create user
//     const newUser = await User.create({
//       email_id: email.trim(),
//       password: hashedPassword,
//       userType: 'admin',
//       is_active: true
//     });

//     // Generate license key
//     let licenseKey;
//     let isUnique = false;
//     let attempts = 0;
//     const maxAttempts = 10;

//     while (!isUnique && attempts < maxAttempts) {
//       licenseKey = generateLicenseKey();
//       const [existing] = await connection.execute(
//         'SELECT * FROM licenses WHERE license_key = ?',
//         [licenseKey]
//       );
//       if (existing.length === 0) {
//         isUnique = true;
//       }
//       attempts++;
//     }

//     if (!isUnique) {
//       return res.status(500).json({
//         status: false,
//         message: 'Failed to generate unique license key'
//       });
//     }

//     // Create license
//     const expiryDateValue = expiry ? expiry.toISOString().slice(0, 19).replace('T', ' ') : null;
//     await connection.execute(
//       `INSERT INTO licenses (admin_id, license_key, assigned_email, status, is_active, expiry_date, created_at) 
//        VALUES (?, ?, ?, ?, ?, ?, NOW())`,
//       [newUser.id, licenseKey, email.trim(), 'active', true, expiryDateValue]
//     );

//     // Get created license for response
//     const [licenses] = await connection.execute(
//       'SELECT * FROM licenses WHERE admin_id = ?',
//       [newUser.id]
//     );

//     // Create notification for SuperAdmin
//     await createNotification(
//       'admin_created',
//       `New admin created: ${email}`,
//       'superadmin',
//       null,
//       licenses[0].id
//     );

//     return res.status(200).json({
//       status: true,
//       message: 'Admin created successfully',
//       data: {
//         admin: {
//           id: newUser.id,
//           email: newUser.email_id,
//           userType: newUser.userType
//         },
//         license: {
//           license_key: licenseKey,
//           expiry_date: expiryDateValue,
//           start_date: start.toISOString().slice(0, 19).replace('T', ' ')
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Create admin error:', error.message);
//     return res.status(500).json({
//       status: false,
//       message: 'An error occurred while creating admin'
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// };

// /**
//  * GET /api/superadmin/admins
//  * Get all Admin users with their licenses (SuperAdmin only)
//  */
// exports.getAllAdmins = async (req, res) => {
//   let connection = null;
//   try {
//     // Strict role check - must be SuperAdmin
//     if (!req.user) {
//       return res.status(401).json({
//         status: false,
//         message: 'Authentication required'
//       });
//     }

//     if (req.user.userType !== 'superadmin') {
//       return res.status(403).json({
//         status: false,
//         message: 'SuperAdmin access required. You do not have permission to view all admins.'
//       });
//     }

//     try {
//       connection = await pool.getConnection();
//     } catch (dbError) {
//       console.error('Database connection error:', dbError);
//       return res.status(500).json({
//         status: false,
//         message: 'Database connection failed. Please try again later.'
//       });
//     }

//     // Get all admin users with their licenses
//     // Handle both boolean and tinyint(1) for is_active
//     let admins;
//     try {
//       [admins] = await connection.execute(
//         `SELECT 
//           u.id,
//           u.email_id,
//           u.is_active as user_active,
//           l.id as license_id,
//           l.license_key,
//           l.status as license_status,
//           l.is_active as license_active,
//           l.expiry_date,
//           l.created_at as license_created_at,
//           l.updated_at as license_updated_at,
//           CASE 
//             WHEN l.expiry_date IS NULL THEN NULL
//             WHEN l.expiry_date > NOW() THEN DATEDIFF(l.expiry_date, NOW())
//             ELSE -1
//           END as days_remaining
//         FROM users u
//         LEFT JOIN licenses l ON u.id = l.admin_id
//         WHERE u.userType = 'admin'
//         ORDER BY u.id DESC`
//       );
//     } catch (queryError) {
//       console.error('Query error:', queryError);
//       return res.status(500).json({
//         status: false,
//         message: 'Error fetching admins. Please try again later.'
//       });
//     }

//     // Format response - handle both boolean and numeric values
//     const formattedAdmins = (admins || []).map(admin => {
//       // Handle boolean conversion safely
//       const userActive = admin.user_active === 1 || admin.user_active === true || admin.user_active === '1';
//       const licenseActive = admin.license_active === 1 || admin.license_active === true || admin.license_active === '1';
      
//       return {
//         id: admin.id,
//         email: admin.email_id,
//         user_active: userActive,
//         license: admin.license_id ? {
//           id: admin.license_id,
//           license_key: admin.license_key,
//           status: admin.license_status,
//           is_active: licenseActive,
//           expiry_date: admin.expiry_date,
//           days_remaining: admin.days_remaining !== null && admin.days_remaining !== undefined ? parseInt(admin.days_remaining) : null,
//           created_at: admin.license_created_at,
//           updated_at: admin.license_updated_at
//         } : null
//       };
//     });

//     return res.status(200).json({
//       status: true,
//       data: formattedAdmins,
//       message: 'Admins retrieved successfully'
//     });

//   } catch (error) {
//     console.error('Get all admins error:', error.message);
//     console.error('Error stack:', error.stack);
    
//     return res.status(500).json({
//       status: false,
//       message: 'An error occurred while retrieving admins'
//     });
//   } finally {
//     if (connection) {
//       try {
//         connection.release();
//       } catch (releaseError) {
//         console.error('Error releasing connection:', releaseError);
//       }
//     }
//   }
// };

// /**
//  * PUT /api/superadmin/renew-license/:adminId
//  * Renew or extend admin license (SuperAdmin only)
//  */
// exports.renewLicense = async (req, res) => {
//   let connection = null;
//   try {
//     // Strict role check - must be SuperAdmin
//     if (!req.user || req.user.userType !== 'superadmin') {
//       return res.status(403).json({
//         status: false,
//         message: 'SuperAdmin access required'
//       });
//     }

//     const { adminId } = req.params;
//     const { expiryDate, extendDays } = req.body;

//     if (!adminId || isNaN(parseInt(adminId))) {
//       return res.status(400).json({
//         status: false,
//         message: 'Valid admin ID is required'
//       });
//     }

//     connection = await pool.getConnection();

//     // Get admin and license - alias l.id as license_id to match getAllAdmins format
//     const [admins] = await connection.execute(
//       `SELECT 
//         u.*, 
//         l.id as license_id,
//         l.license_key,
//         l.expiry_date,
//         l.is_active as license_is_active,
//         l.status as license_status
//       FROM users u
//       LEFT JOIN licenses l ON u.id = l.admin_id
//       WHERE u.id = ? AND u.userType = 'admin'`,
//       [adminId]
//     );

//     if (admins.length === 0) {
//       return res.status(404).json({
//         status: false,
//         message: 'Admin not found'
//       });
//     }

//     const admin = admins[0];

//     // Check if license exists - use license_id (aliased from l.id)
//     if (!admin.license_id) {
//       return res.status(400).json({
//         status: false,
//         message: 'Admin does not have a license'
//       });
//     }

//     // Calculate new expiry date
//     let newExpiryDate = null;
//     if (expiryDate) {
//       const parsedDate = new Date(expiryDate + 'T23:59:59');
//       newExpiryDate = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
//     } else if (extendDays) {
//       const currentExpiry = admin.expiry_date ? new Date(admin.expiry_date) : new Date();
//       const newExpiry = new Date(currentExpiry);
//       newExpiry.setDate(newExpiry.getDate() + parseInt(extendDays));
//       newExpiry.setHours(23, 59, 59, 0);
//       newExpiryDate = newExpiry.toISOString().slice(0, 19).replace('T', ' ');
//     } else {
//       return res.status(400).json({
//         status: false,
//         message: 'Either expiryDate or extendDays is required'
//       });
//     }

//     // Update license
//     await connection.execute(
//       `UPDATE licenses 
//        SET expiry_date = ?, is_active = TRUE, status = 'active', updated_at = NOW() 
//        WHERE id = ?`,
//       [newExpiryDate, admin.license_id]
//     );

//     // Create notifications
//     await createNotification(
//       'renewal_approved',
//       `Your license has been renewed. New expiry date: ${newExpiryDate.split(' ')[0]}`,
//       'admin',
//       adminId,
//       admin.license_id
//     );

//     await createNotification(
//       'license_renewed',
//       `License renewed for admin: ${admin.email_id}`,
//       'superadmin',
//       null,
//       admin.license_id
//     );

//     return res.status(200).json({
//       status: true,
//       message: 'License renewed successfully',
//       data: {
//         expiry_date: newExpiryDate
//       }
//     });

//   } catch (error) {
//     console.error('Renew license error:', error.message);
//     return res.status(500).json({
//       status: false,
//       message: 'An error occurred while renewing license'
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// };

// /**
//  * PUT /api/superadmin/toggle-admin/:adminId
//  * Activate/Deactivate admin (SuperAdmin only)
//  */
// exports.toggleAdmin = async (req, res) => {
//   let connection = null;
//   try {
//     // Strict role check - must be SuperAdmin
//     if (!req.user || req.user.userType !== 'superadmin') {
//       return res.status(403).json({
//         status: false,
//         message: 'SuperAdmin access required'
//       });
//     }

//     const { adminId } = req.params;

//     if (!adminId || isNaN(parseInt(adminId))) {
//       return res.status(400).json({
//         status: false,
//         message: 'Valid admin ID is required'
//       });
//     }

//     connection = await pool.getConnection();

//     // Get admin
//     const admin = await User.findOne({ where: { id: adminId, userType: 'admin' } });
//     if (!admin) {
//       return res.status(404).json({
//         status: false,
//         message: 'Admin not found'
//       });
//     }

//     // Toggle status
//     const newStatus = !admin.is_active;
//     admin.is_active = newStatus;
//     await admin.save();

//     // Also deactivate license if deactivating admin
//     if (!newStatus) {
//       await connection.execute(
//         `UPDATE licenses SET is_active = FALSE, updated_at = NOW() WHERE admin_id = ?`,
//         [adminId]
//       );
//     }

//     return res.status(200).json({
//       status: true,
//       message: `Admin ${newStatus ? 'activated' : 'deactivated'} successfully`,
//       data: {
//         is_active: newStatus
//       }
//     });

//   } catch (error) {
//     console.error('Toggle admin error:', error.message);
//     return res.status(500).json({
//       status: false,
//       message: 'An error occurred while updating admin status'
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// };

// /**
//  * PUT /api/superadmin/update-expiry/:adminId
//  * Update license expiry date (SuperAdmin only)
//  */
// exports.updateExpiry = async (req, res) => {
//   let connection = null;
//   try {
//     // Strict role check - must be SuperAdmin
//     if (!req.user || req.user.userType !== 'superadmin') {
//       return res.status(403).json({
//         status: false,
//         message: 'SuperAdmin access required'
//       });
//     }

//     const { adminId } = req.params;
//     const { expiryDate } = req.body;

//     if (!adminId || isNaN(parseInt(adminId))) {
//       return res.status(400).json({
//         status: false,
//         message: 'Valid admin ID is required'
//       });
//     }

//     connection = await pool.getConnection();

//     // Get license
//     const [licenses] = await connection.execute(
//       'SELECT * FROM licenses WHERE admin_id = ?',
//       [adminId]
//     );

//     if (licenses.length === 0) {
//       return res.status(404).json({
//         status: false,
//         message: 'License not found for this admin'
//       });
//     }

//     // Update expiry date
//     let expiryDateValue = null;
//     if (expiryDate) {
//       const parsedDate = new Date(expiryDate + 'T23:59:59');
//       expiryDateValue = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
//     }

//     await connection.execute(
//       `UPDATE licenses SET expiry_date = ?, updated_at = NOW() WHERE admin_id = ?`,
//       [expiryDateValue, adminId]
//     );

//     return res.status(200).json({
//       status: true,
//       message: 'Expiry date updated successfully',
//       data: {
//         expiry_date: expiryDateValue
//       }
//     });

//   } catch (error) {
//     console.error('Update expiry error:', error.message);
//     return res.status(500).json({
//       status: false,
//       message: 'An error occurred while updating expiry date'
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// };

// /**
//  * GET /api/admin/my-data
//  * Get current Admin's own data (Admin only)
//  */
// exports.getMyAdminData = async (req, res) => {
//   let connection = null;
//   try {
//     // Strict role check - must be Admin
//     if (!req.user) {
//       return res.status(401).json({
//         status: false,
//         message: 'Authentication required'
//       });
//     }

//     if (req.user.userType !== 'admin') {
//       return res.status(403).json({
//         status: false,
//         message: 'Admin access required'
//       });
//     }

//     try {
//       connection = await pool.getConnection();
//     } catch (dbError) {
//       console.error('Database connection error:', dbError);
//       return res.status(500).json({
//         status: false,
//         message: 'Database connection failed. Please try again later.'
//       });
//     }

//     // Get only this admin's data
//     let adminData;
//     try {
//       [adminData] = await connection.execute(
//         `SELECT 
//           u.id,
//           u.email_id,
//           u.is_active as user_active,
//           l.id as license_id,
//           l.license_key,
//           l.status as license_status,
//           l.is_active as license_active,
//           l.expiry_date,
//           l.created_at as license_created_at,
//           l.updated_at as license_updated_at,
//           CASE 
//             WHEN l.expiry_date IS NULL THEN NULL
//             WHEN l.expiry_date > NOW() THEN DATEDIFF(l.expiry_date, NOW())
//             ELSE -1
//           END as days_remaining
//         FROM users u
//         LEFT JOIN licenses l ON u.id = l.admin_id
//         WHERE u.id = ? AND u.userType = 'admin'`,
//         [req.user.id]
//       );
//     } catch (queryError) {
//       console.error('Query error:', queryError);
//       return res.status(500).json({
//         status: false,
//         message: 'Error fetching admin data. Please try again later.'
//       });
//     }

//     if (!adminData || adminData.length === 0) {
//       return res.status(404).json({
//         status: false,
//         message: 'Admin data not found'
//       });
//     }

//     const admin = adminData[0];
//     const userActive = admin.user_active === 1 || admin.user_active === true || admin.user_active === '1';
//     const licenseActive = admin.license_active === 1 || admin.license_active === true || admin.license_active === '1';

//     const formattedAdmin = {
//       id: admin.id,
//       email: admin.email_id,
//       user_active: userActive,
//       license: admin.license_id ? {
//         id: admin.license_id,
//         license_key: admin.license_key,
//         status: admin.license_status,
//         is_active: licenseActive,
//         expiry_date: admin.expiry_date,
//         days_remaining: admin.days_remaining !== null && admin.days_remaining !== undefined ? parseInt(admin.days_remaining) : null,
//         created_at: admin.license_created_at,
//         updated_at: admin.license_updated_at
//       } : null
//     };

//     return res.status(200).json({
//       status: true,
//       data: formattedAdmin,
//       message: 'Admin data retrieved successfully'
//     });

//   } catch (error) {
//     console.error('Get my admin data error:', error.message);
//     return res.status(500).json({
//       status: false,
//       message: 'An error occurred while retrieving admin data'
//     });
//   } finally {
//     if (connection) {
//       try {
//         connection.release();
//       } catch (releaseError) {
//         console.error('Error releasing connection:', releaseError);
//       }
//     }
//   }
// };

// /**
//  * GET /api/superadmin/expiring-licenses
//  * Get licenses expiring soon (SuperAdmin only)
//  */
// exports.getExpiringLicenses = async (req, res) => {
//   let connection = null;
//   try {
//     // Strict role check - must be SuperAdmin
//     if (!req.user) {
//       return res.status(401).json({
//         status: false,
//         message: 'Authentication required'
//       });
//     }

//     if (req.user.userType !== 'superadmin') {
//       return res.status(403).json({
//         status: false,
//         message: 'SuperAdmin access required'
//       });
//     }

//     const daysThreshold = parseInt(req.query.days || 7);

//     connection = await pool.getConnection();

//     // Get licenses expiring within threshold
//     const [licenses] = await connection.execute(
//       `SELECT 
//         u.id as admin_id,
//         u.email_id,
//         l.id as license_id,
//         l.license_key,
//         l.expiry_date,
//         DATEDIFF(l.expiry_date, NOW()) as days_remaining
//       FROM licenses l
//       JOIN users u ON l.admin_id = u.id
//       WHERE l.is_active = TRUE
//       AND l.expiry_date IS NOT NULL
//       AND l.expiry_date > NOW()
//       AND DATEDIFF(l.expiry_date, NOW()) <= ?
//       ORDER BY l.expiry_date ASC`,
//       [daysThreshold]
//     );

//     return res.status(200).json({
//       status: true,
//       data: licenses,
//       message: 'Expiring licenses retrieved successfully'
//     });

//   } catch (error) {
//     console.error('Get expiring licenses error:', error.message);
//     return res.status(500).json({
//       status: false,
//       message: 'An error occurred while retrieving expiring licenses'
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// };


// const db = require("../../../config/config");
// const User = db.user;
// const License = db.license;
// const Notification = db.notification;
// const bcrypt = require("bcryptjs");

// /* Generate License Key */
// function generateLicenseKey() {
//   const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
//   const seg = () =>
//     Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
//   return `APP-${seg()}-${seg()}-${seg()}`;
// }

// /* Create Notification */
// const createNotification = async ({ type, message, targetRole, targetUserId = null, licenseId = null }) => {
//   try {
//     await Notification.create({
//       type,
//       message,
//       target_role: targetRole,
//       target_user_id: targetUserId,
//       related_license_id: licenseId,
//     });
//   } catch (err) {
//     console.error("Notification error:", err.message);
//   }
// };

// /* ===============================
//    CREATE ADMIN
// ================================ */
// exports.createAdmin = async (req, res) => {
//   try {
//     if (req.user.userType !== 'superadmin') return res.status(403).json({ status: false, message: 'SuperAdmin only' });

//     const { email, password, expiryDate, licensePeriodDays } = req.body;
//     if (!email || !password) return res.status(400).json({ status: false, message: 'Email & password required' });

//     const exists = await User.findOne({ where: { email_id: email } });
//     if (exists) return res.status(400).json({ status: false, message: 'Admin already exists' });

//     const hashed = await bcrypt.hash(password, 10);

//     const admin = await User.create({
//       email_id: email,
//       password: hashed,
//       userType: 'admin',
//       is_active: true,
//     });

//     let expiry = null;
//     if (expiryDate) {
//       expiry = new Date(expiryDate);
//       expiry.setHours(23, 59, 59);
//     } else if (licensePeriodDays) {
//       expiry = new Date();
//       expiry.setDate(expiry.getDate() + Number(licensePeriodDays));
//     }

//     const license = await License.create({
//       admin_id: admin.id,
//       license_key: generateLicenseKey(),
//       assigned_email: email,
//       status: 'active',
//       is_active: true,
//       expiry_date: expiry,
//     });

//     await createNotification({
//       type: 'admin_created',
//       message: `New admin created: ${email}`,
//       targetRole: 'superadmin',
//       licenseId: license.id,
//     });

//     return res.status(201).json({ status: true, message: 'Admin created', data: { admin, license } });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ status: false, message: error.message });
//   }
// };

// /* GET ALL ADMINS */
// exports.getAllAdmins = async (req, res) => {
//   try {
//     if (req.user.userType !== 'superadmin') return res.status(403).json({ status: false, message: 'SuperAdmin only' });

//     const admins = await User.findAll({
//       where: { userType: 'admin' },
//       include: [{ model: License, as: 'license' }],
//       order: [['id', 'DESC']],
//     });

//     return res.status(200).json({ status: true, data: admins });
//   } catch (err) {
//     return res.status(500).json({ status: false, message: err.message });
//   }
// };

// /* RENEW LICENSE */
// exports.renewLicense = async (req, res) => {
//   try {
//     if (req.user.userType !== 'superadmin') return res.status(403).json({ status: false, message: 'SuperAdmin only' });

//     const { adminId } = req.params;
//     const { extendDays } = req.body;

//     const license = await License.findOne({ where: { admin_id: adminId } });
//     if (!license) return res.status(404).json({ status: false, message: 'License not found' });

//     const newExpiry = new Date(license.expiry_date || new Date());
//     newExpiry.setDate(newExpiry.getDate() + Number(extendDays));

//     await license.update({ expiry_date: newExpiry, is_active: true, status: 'active' });

//     return res.status(200).json({ status: true, message: 'License renewed', expiry_date: newExpiry });
//   } catch (err) {
//     return res.status(500).json({ status: false, message: err.message });
//   }
// };

// /* TOGGLE ADMIN ACTIVE/INACTIVE */
// exports.toggleAdmin = async (req, res) => {
//   try {
//     if (req.user.userType !== 'superadmin') return res.status(403).json({ status: false, message: 'SuperAdmin only' });

//     const { adminId } = req.params;
//     const admin = await User.findByPk(adminId);
//     if (!admin) return res.status(404).json({ status: false, message: 'Admin not found' });

//     admin.is_active = !admin.is_active;
//     await admin.save();

//     return res.status(200).json({ status: true, message: `Admin ${admin.is_active ? 'activated' : 'deactivated'}` });
//   } catch (err) {
//     return res.status(500).json({ status: false, message: err.message });
//   }
// };

// /* UPDATE LICENSE EXPIRY */
// exports.updateExpiry = async (req, res) => {
//   try {
//     if (req.user.userType !== 'superadmin') return res.status(403).json({ status: false, message: 'SuperAdmin only' });

//     const { adminId } = req.params;
//     const { expiryDate } = req.body;

//     const license = await License.findOne({ where: { admin_id: adminId } });
//     if (!license) return res.status(404).json({ status: false, message: 'License not found' });

//     let newExpiry = null;
//     if (expiryDate) {
//       newExpiry = new Date(expiryDate);
//       newExpiry.setHours(23, 59, 59);
//     }

//     license.expiry_date = newExpiry;
//     await license.save();

//     return res.status(200).json({ status: true, message: 'Expiry updated', expiry_date: newExpiry });
//   } catch (err) {
//     return res.status(500).json({ status: false, message: err.message });
//   }
// };

// /* GET LICENSES NEARING EXPIRY */
// exports.getExpiringLicenses = async (req, res) => {
//   try {
//     if (req.user.userType !== 'superadmin') return res.status(403).json({ status: false, message: 'SuperAdmin only' });

//     const today = new Date();
//     const next30 = new Date();
//     next30.setDate(today.getDate() + 30);

//     const licenses = await License.findAll({
//       where: { expiry_date: { $between: [today, next30] } }, // Sequelize Op may need to be updated
//       include: [{ model: User, as: 'admin' }],
//       order: [['expiry_date', 'ASC']],
//     });

//     return res.status(200).json({ status: true, data: licenses });
//   } catch (err) {
//     return res.status(500).json({ status: false, message: err.message });
//   }
// };

// /* GET MY ADMIN DATA */
// exports.getMyAdminData = async (req, res) => {
//   try {
//     const admin = await User.findByPk(req.user.id, { include: [{ model: License, as: 'license' }] });
//     return res.status(200).json({ status: true, data: admin });
//   } catch (err) {
//     return res.status(500).json({ status: false, message: err.message });
//   }
// };




const db = require("../../../config/config");
const User = db.user;
const License = db.license;
const Notification = db.notification;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const accessSecretKey = process.env.ACCESS_SECRET_KEY;

/**
 * Generate a random license key in format: APP-XXXX-YYYY-ZZZZ
 */
function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const generateSegment = () => {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  };
  return `APP-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
}

/**
 * Check if user is SuperAdmin
 */
function isSuperAdmin(req) {
  try {
    if (req.user && req.user.userType === 'superadmin') return true;
    const authHeader = req.headers['authorization'];
    if (!authHeader) return false;
    const token = authHeader.split(' ')[1];
    if (!token) return false;
    const decoded = jwt.verify(token, accessSecretKey);
    return decoded.type === 'superadmin';
  } catch {
    return false;
  }
}

/**
 * Create notification (Sequelize version)
 */
async function createNotification(type, message, targetRole, targetUserId = null, licenseId = null) {
  try {
    await Notification.create({
      type,
      message,
      target_role: targetRole,
      target_user_id: targetUserId,
      related_license_id: licenseId,
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
}

/**
 * POST /api/superadmin/create-admin
 */
exports.createAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'superadmin') {
      return res.status(403).json({ status: false, message: 'SuperAdmin access required' });
    }

    const { email, password, startDate, expiryDate, licensePeriodDays } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: false, message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ where: { email_id: email.trim() } });
    if (existingUser) {
      return res.status(400).json({ status: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const start = startDate ? new Date(startDate) : new Date();
    let expiry = null;

    if (expiryDate) {
      expiry = new Date(expiryDate + 'T23:59:59');
    } else if (licensePeriodDays) {
      expiry = new Date(start);
      expiry.setDate(expiry.getDate() + parseInt(licensePeriodDays));
      expiry.setHours(23, 59, 59, 0);
    }

    // Create user
    const newUser = await User.create({
      email_id: email.trim(),
      password: hashedPassword,
      userType: 'admin',
      is_active: true,
    });

    // Generate unique license key
    let licenseKey, isUnique = false, attempts = 0;
    const maxAttempts = 10;
    while (!isUnique && attempts < maxAttempts) {
      licenseKey = generateLicenseKey();
      const existing = await License.findOne({ where: { license_key: licenseKey } });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ status: false, message: 'Failed to generate unique license key' });
    }

    // Create license
    const newLicense = await License.create({
      admin_id: newUser.id,
      license_key: licenseKey,
      assigned_email: email.trim(),
      status: 'active',
      is_active: true,
      expiry_date: expiry,
    });

    // Create notification
    await createNotification(
      'admin_created',
      `New admin created: ${email}`,
      'superadmin',
      null,
      newLicense.id
    );

    return res.status(200).json({
      status: true,
      message: 'Admin created successfully',
      data: {
        admin: {
          id: newUser.id,
          email: newUser.email_id,
          userType: newUser.userType,
        },
        license: {
          license_key: licenseKey,
          expiry_date: expiry ? expiry.toISOString().slice(0, 19).replace('T', ' ') : null,
          start_date: start.toISOString().slice(0, 19).replace('T', ' '),
        },
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred while creating admin' });
  }
};

/**
 * GET /api/superadmin/admins
 */
exports.getAllAdmins = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'superadmin') {
      return res.status(403).json({ status: false, message: 'SuperAdmin access required' });
    }

    // Use Sequelize include for LEFT JOIN
    const admins = await User.findAll({
      where: { userType: 'admin' },
      attributes: ['id', 'email_id', 'is_active'],
      include: [{
        model: License,
        as: 'license', // 👈 must match association alias
        attributes: ['id', 'license_key', 'status', 'is_active', 'expiry_date', 'created_at', 'updated_at'],
        required: false,
      }],
      order: [['id', 'DESC']],
    });

    const formattedAdmins = admins.map(admin => {
      const userActive = [true, 1, '1'].includes(admin.is_active);
      const license = admin.license ? {
        id: admin.license.id,
        license_key: admin.license.license_key,
        status: admin.license.status,
        is_active: [true, 1, '1'].includes(admin.license.is_active),
        expiry_date: admin.license.expiry_date,
        days_remaining: admin.license.expiry_date
          ? Math.floor((new Date(admin.license.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
          : null,
        created_at: admin.license.created_at,
        updated_at: admin.license.updated_at,
      } : null;

      return {
        id: admin.id,
        email: admin.email_id,
        user_active: userActive,
        license,
      };
    });

    return res.status(200).json({
      status: true,
      data: formattedAdmins,
      message: 'Admins retrieved successfully',
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred while retrieving admins' });
  }
};

/**
 * PUT /api/superadmin/renew-license/:adminId
 */
exports.renewLicense = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'superadmin') {
      return res.status(403).json({ status: false, message: 'SuperAdmin access required' });
    }

    const { adminId } = req.params;
    const { expiryDate, extendDays } = req.body;

    const adminIntId = parseInt(adminId);
    if (!adminIntId) {
      return res.status(400).json({ status: false, message: 'Valid admin ID is required' });
    }

    const admin = await User.findOne({
      where: { id: adminIntId, userType: 'admin' },
      include: [{ model: License, as: 'license', required: false }],
    });

    if (!admin) {
      return res.status(404).json({ status: false, message: 'Admin not found' });
    }

    if (!admin.license) {
      return res.status(400).json({ status: false, message: 'Admin does not have a license' });
    }

    let newExpiryDate = null;
    if (expiryDate) {
      newExpiryDate = new Date(expiryDate + 'T23:59:59');
    } else if (extendDays) {
      const currentExpiry = admin.license.expiry_date ? new Date(admin.license.expiry_date) : new Date();
      newExpiryDate = new Date(currentExpiry);
      newExpiryDate.setDate(newExpiryDate.getDate() + parseInt(extendDays));
      newExpiryDate.setHours(23, 59, 59, 0);
    } else {
      return res.status(400).json({ status: false, message: 'Either expiryDate or extendDays is required' });
    }

    // Update license
    await admin.license.update({
      expiry_date: newExpiryDate,
      is_active: true,
      status: 'active',
    });

    // Notifications
    await createNotification(
      'renewal_approved',
      `Your license has been renewed. New expiry date: ${newExpiryDate.toISOString().split('T')[0]}`,
      'admin',
      admin.id,
      admin.license.id
    );

    await createNotification(
      'license_renewed',
      `License renewed for admin: ${admin.email_id}`,
      'superadmin',
      null,
      admin.license.id
    );

    return res.status(200).json({
      status: true,
      message: 'License renewed successfully',
      data: {
        expiry_date: newExpiryDate.toISOString().slice(0, 19).replace('T', ' '),
      },
    });
  } catch (error) {
    console.error('Renew license error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred while renewing license' });
  }
};

/**
 * PUT /api/superadmin/toggle-admin/:adminId
 */
exports.toggleAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'superadmin') {
      return res.status(403).json({ status: false, message: 'SuperAdmin access required' });
    }

    const { adminId } = req.params;
    const adminIntId = parseInt(adminId);
    if (!adminIntId) {
      return res.status(400).json({ status: false, message: 'Valid admin ID is required' });
    }

    const admin = await User.findOne({ where: { id: adminIntId, userType: 'admin' } });
    if (!admin) {
      return res.status(404).json({ status: false, message: 'Admin not found' });
    }

    const newStatus = !admin.is_active;
    admin.is_active = newStatus;
    await admin.save();

    // Deactivate license if admin is deactivated
    if (!newStatus && admin.license) {
      // Fetch license if not already loaded
      const license = await License.findOne({ where: { admin_id: admin.id } });
      if (license) {
        await license.update({ is_active: false });
      }
    }

    return res.status(200).json({
      status: true,
      message: `Admin ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: { is_active: newStatus },
    });
  } catch (error) {
    console.error('Toggle admin error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred while updating admin status' });
  }
};

/**
 * PUT /api/superadmin/update-expiry/:adminId
 */
exports.updateExpiry = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'superadmin') {
      return res.status(403).json({ status: false, message: 'SuperAdmin access required' });
    }

    const { adminId } = req.params;
    const { expiryDate } = req.body;

    const adminIntId = parseInt(adminId);
    if (!adminIntId) {
      return res.status(400).json({ status: false, message: 'Valid admin ID is required' });
    }

    const license = await License.findOne({ where: { admin_id: adminIntId } });
    if (!license) {
      return res.status(404).json({ status: false, message: 'License not found for this admin' });
    }

    let expiryDateValue = null;
    if (expiryDate) {
      expiryDateValue = new Date(expiryDate + 'T23:59:59');
    }

    await license.update({ expiry_date: expiryDateValue });

    return res.status(200).json({
      status: true,
      message: 'Expiry date updated successfully',
      data: {
        expiry_date: expiryDateValue ? expiryDateValue.toISOString().slice(0, 19).replace('T', ' ') : null,
      },
    });
  } catch (error) {
    console.error('Update expiry error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred while updating expiry date' });
  }
};

/**
 * GET /api/admin/my-data
 */
exports.getMyAdminData = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ status: false, message: 'Admin access required' });
    }

    const admin = await User.findOne({
      where: { id: req.user.id, userType: 'admin' },
      include: [{ model: License, as: 'license', required: false }],
    });

    if (!admin) {
      return res.status(404).json({ status: false, message: 'Admin data not found' });
    }

    const userActive = [true, 1, '1'].includes(admin.is_active);
    const licenseData = admin.license ? {
      id: admin.license.id,
      license_key: admin.license.license_key,
      status: admin.license.status,
      is_active: [true, 1, '1'].includes(admin.license.is_active),
      expiry_date: admin.license.expiry_date,
      days_remaining: admin.license.expiry_date
        ? Math.floor((new Date(admin.license.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null,
      created_at: admin.license.created_at,
      updated_at: admin.license.updated_at,
    } : null;

    return res.status(200).json({
      status: true,
      data: {
        id: admin.id,
        email: admin.email_id,
        user_active: userActive,
        license: licenseData,
      },
      message: 'Admin data retrieved successfully',
    });
  } catch (error) {
    console.error('Get my admin data error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred while retrieving admin data' });
  }
};

/**
 * GET /api/superadmin/expiring-licenses
 */
exports.getExpiringLicenses = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'superadmin') {
      return res.status(403).json({ status: false, message: 'SuperAdmin access required' });
    }

    const daysThreshold = parseInt(req.query.days || 7);

    const licenses = await License.findAll({
      where: {
        is_active: true,
        expiry_date: {
          [db.Sequelize.Op.lte]: new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000),
          [db.Sequelize.Op.gte]: new Date(),
        },
      },
      include: [{
        model: User,
        as: 'admin', // 👈 from license.belongsTo(user, { as: 'admin' })
        attributes: ['id', 'email_id'],
        required: true,
      }],
      order: [['expiry_date', 'ASC']],
    });

    const data = licenses.map(lic => ({
      admin_id: lic.admin.id,
      email_id: lic.admin.email_id,
      license_id: lic.id,
      license_key: lic.license_key,
      expiry_date: lic.expiry_date,
      days_remaining: lic.expiry_date
        ? Math.floor((new Date(lic.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null,
    }));

    return res.status(200).json({
      status: true,
      data,
      message: 'Expiring licenses retrieved successfully',
    });
  } catch (error) {
    console.error('Get expiring licenses error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred while retrieving expiring licenses' });
  }
};