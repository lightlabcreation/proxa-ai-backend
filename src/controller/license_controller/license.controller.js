// const db = require("../../../config/config");
// const User = db.user;
// const License = db.license;
// const Notification = db.notification;
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const accessSecretKey = process.env.ACCESS_SECRET_KEY;

// /**
//  * Generate a random license key in format: APP-XXXX-YYYY-ZZZZ
//  */
// function generateLicenseKey() {
//   const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
//   const generateSegment = () => {
//     let segment = "";
//     for (let i = 0; i < 4; i++) {
//       segment += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return segment;
//   };
//   return `APP-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
// }

// /**
//  * Extract email from JWT token
//  */
// function getEmailFromToken(req) {
//   try {
//     const authHeader = req.headers["authorization"];
//     if (!authHeader) return null;
//     const token = authHeader.split(" ")[1];
//     if (!token) return null;
//     const decoded = jwt.verify(token, accessSecretKey);
//     return decoded.email || null;
//   } catch {
//     return null;
//   }
// }

// /**
//  * Check if user is SuperAdmin
//  */
// function isSuperAdmin(req) {
//   return req.user?.userType === "superadmin";
// }

// /**
//  * Create a notification
//  */
// async function createNotification(type, message, targetRole, targetUserId = null, licenseId = null) {
//   try {
//     await Notification.create({
//       type,
//       message,
//       target_role: targetRole,
//       target_user_id: targetUserId,
//       related_license_id: licenseId,
//     });
//   } catch (error) {
//     console.error("Notification creation error:", error.message);
//   }
// }

// /**
//  * ------------------------
//  * LICENSE CONTROLLERS
//  * ------------------------
//  */

// // POST /api/license/activate
// exports.activateLicense = async (req, res) => {
//   try {
//     const { licenseKey } = req.body;
//     if (!licenseKey) return res.status(400).json({ status: false, message: "License key is required" });

//     const email = getEmailFromToken(req);
//     if (!email) return res.status(401).json({ status: false, message: "Authentication required" });

//     const key = licenseKey.trim().toUpperCase();
//     const keyPattern = /^APP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
//     if (!keyPattern.test(key)) return res.status(400).json({ status: false, message: "Invalid license key format" });

//     const license = await License.findOne({ where: { license_key: key } });
//     if (!license) return res.status(404).json({ status: false, message: "License not found" });

//     const user = await User.findOne({ where: { email_id: email } });
//     if (!user) return res.status(404).json({ status: false, message: "User not found" });

//     if (license.admin_id && license.admin_id !== user.id) {
//       return res.status(400).json({ status: false, message: "This license is assigned to another admin" });
//     }

//     // Check if user already has active license
//     const existingLicense = await License.findOne({
//       where: { admin_id: user.id, is_active: true, status: "active" },
//     });

//     if (existingLicense) return res.status(400).json({ status: false, message: "You already have an active license" });

//     // Activate license
//     license.admin_id = user.id;
//     license.assigned_email = email;
//     license.status = "active";
//     license.is_active = true;
//     await license.save();

//     return res.status(200).json({ status: true, message: "License activated successfully" });
//   } catch (error) {
//     console.error("Activate license error:", error.message);
//     return res.status(500).json({ status: false, message: "Error activating license" });
//   }
// };

// // GET /api/license/validate
// exports.validateLicense = async (req, res) => {
//   try {
//     const email = getEmailFromToken(req);
//     if (!email) return res.status(401).json({ status: false, valid: false, message: "Authentication required" });

//     const user = await User.findOne({ where: { email_id: email } });
//     let license;

//     if (user?.userType === "admin") {
//       license = await License.findOne({
//         where: { admin_id: user.id, is_active: true, status: "active" },
//       });
//     } else {
//       license = await License.findOne({
//         where: { assigned_email: email, is_active: true, status: "active" },
//       });
//     }

//     const isValid = !!license;
//     return res.status(200).json({ status: true, valid: isValid, message: isValid ? "License is valid" : "No active license found" });
//   } catch (error) {
//     console.error("Validate license error:", error.message);
//     return res.status(500).json({ status: false, valid: false, message: "Error validating license" });
//   }
// };

// // POST /api/license/verify (no auth required)
// exports.verifyLicense = async (req, res) => {
//   try {
//     const { licenseKey } = req.body;
//     if (!licenseKey) return res.status(400).json({ status: false, message: "License key is required" });

//     const key = licenseKey.trim().toUpperCase();
//     const license = await License.findOne({ where: { license_key: key, is_active: true, status: "active" } });

//     if (!license) return res.status(404).json({ status: false, message: "License not valid" });

//     return res.status(200).json({ status: true, message: "License is valid" });
//   } catch (error) {
//     console.error("Verify license error:", error.message);
//     return res.status(500).json({ status: false, message: "Error verifying license" });
//   }
// };

// // GET /api/license/generate
// exports.generateLicense = async (req, res) => {
//   try {
//     if (!isSuperAdmin(req)) return res.status(403).json({ status: false, message: "SuperAdmin access required" });

//     const { expiryDate } = req.query;

//     let licenseKey, attempts = 0, isUnique = false;
//     while (!isUnique && attempts < 10) {
//       licenseKey = generateLicenseKey();
//       const existing = await License.findOne({ where: { license_key: licenseKey } });
//       if (!existing) isUnique = true;
//       attempts++;
//     }

//     if (!isUnique) return res.status(500).json({ status: false, message: "Failed to generate unique license key" });

//     let expiryValue = null;
//     if (expiryDate) {
//       const parsed = new Date(expiryDate + "T23:59:59");
//       if (isNaN(parsed.getTime())) return res.status(400).json({ status: false, message: "Invalid expiry date format" });
//       expiryValue = parsed;
//     }

//     const newLicense = await License.create({
//       license_key: licenseKey,
//       status: "unused",
//       is_active: true,
//       expiry_date: expiryValue,
//     });

//     return res.status(200).json({ status: true, license_key: newLicense.license_key, expiry_date: expiryValue, message: "License generated successfully" });
//   } catch (error) {
//     console.error("Generate license error:", error.message);
//     return res.status(500).json({ status: false, message: "Error generating license" });
//   }
// };

// // GET /api/license/all
// exports.getAllLicenses = async (req, res) => {
//   try {
//     if (!req.user) return res.status(401).json({ status: false, message: "Authentication required" });

//     let licenses;
//     if (isSuperAdmin(req)) {
//       licenses = await License.findAll({ order: [["createdAt", "DESC"]] });
//     } else {
//       licenses = await License.findAll({ where: { admin_id: req.user.id }, order: [["createdAt", "DESC"]] });
//     }

//     return res.status(200).json({ status: true, data: licenses, message: "Licenses retrieved successfully" });
//   } catch (error) {
//     console.error("Get all licenses error:", error.message);
//     return res.status(500).json({ status: false, message: "Error retrieving licenses" });
//   }
// };

// // PUT /api/license/toggle/:id
// exports.toggleLicenseStatus = async (req, res) => {
//   try {
//     if (!isSuperAdmin(req)) return res.status(403).json({ status: false, message: "SuperAdmin access required" });

//     const { id } = req.params;
//     const license = await License.findByPk(id);
//     if (!license) return res.status(404).json({ status: false, message: "License not found" });

//     license.is_active = !license.is_active;
//     await license.save();

//     return res.status(200).json({ status: true, is_active: license.is_active, message: `License ${license.is_active ? "activated" : "deactivated"} successfully` });
//   } catch (error) {
//     console.error("Toggle license error:", error.message);
//     return res.status(500).json({ status: false, message: "Error updating license status" });
//   }
// };

// // PUT /api/license/expiry/:id
// exports.updateExpiryDate = async (req, res) => {
//   try {
//     if (!isSuperAdmin(req)) return res.status(403).json({ status: false, message: "SuperAdmin access required" });

//     const { id } = req.params;
//     const { expiryDate } = req.body;

//     const license = await License.findByPk(id);
//     if (!license) return res.status(404).json({ status: false, message: "License not found" });

//     let expiryValue = null;
//     if (expiryDate) {
//       const parsed = new Date(expiryDate + "T23:59:59");
//       if (isNaN(parsed.getTime())) return res.status(400).json({ status: false, message: "Invalid expiry date format" });
//       expiryValue = parsed;
//     }

//     license.expiry_date = expiryValue;
//     await license.save();

//     return res.status(200).json({ status: true, expiry_date: expiryValue, message: "Expiry date updated successfully" });
//   } catch (error) {
//     console.error("Update expiry date error:", error.message);
//     return res.status(500).json({ status: false, message: "Error updating expiry date" });
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
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  const generateSegment = () => {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  };
  return `APP-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
}

/**
 * Extract email from JWT token
 */
function getEmailFromToken(req) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    const decoded = jwt.verify(token, accessSecretKey);
    return decoded.email || null;
  } catch {
    return null;
  }
}

/**
 * Create a notification
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
    console.error("Notification creation error:", error.message);
  }
}

/**
 * ------------------------
 * LICENSE CONTROLLERS (Sequelize version – matches MySQL logic exactly)
 * ------------------------
 */

// POST /api/license/activate
exports.activateLicense = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ status: false, message: "Request body is required" });
    }

    const { licenseKey } = req.body;
    if (!licenseKey || typeof licenseKey !== "string" || licenseKey.trim() === "") {
      return res.status(400).json({ status: false, message: "License key is required" });
    }

    const email = getEmailFromToken(req);
    if (!email) return res.status(401).json({ status: false, message: "Authentication required" });

    const key = licenseKey.trim().toUpperCase();
    const keyPattern = /^APP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!keyPattern.test(key)) {
      return res.status(400).json({
        status: false,
        message: "Invalid license key format. Expected format: APP-XXXX-YYYY-ZZZZ",
      });
    }

    let license = await License.findOne({ where: { license_key: key } });
    if (!license) {
      return res.status(404).json({ status: false, message: "Invalid license key" });
    }

    const user = await User.findOne({ where: { email_id: email } });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const licenseAdminId = license.admin_id ? parseInt(license.admin_id) : null;
    const userId = user.id ? parseInt(user.id) : null;

    // Already assigned to this admin
    if (licenseAdminId && licenseAdminId === userId) {
      const isActive = [true, 1, "1"].includes(license.is_active);
      const isStatusActive = license.status === "active";
      if (isStatusActive && isActive) {
        return res.status(200).json({
          status: true,
          message: "License is already active for your account",
        });
      }
      // Reactivate if inactive
      await license.update({
        assigned_email: email,
        status: "active",
        is_active: true,
      });
      return res.status(200).json({ status: true, message: "License activated successfully" });
    }

    // Assigned to another admin
    if (licenseAdminId && licenseAdminId !== userId) {
      return res.status(400).json({
        status: false,
        message: "This license is already assigned to another admin",
      });
    }

    // Not "unused"
    if (license.status && license.status !== "unused") {
      return res.status(400).json({ status: false, message: "Invalid or already used key" });
    }

    // Check existing active license (by admin_id OR assigned_email)
    const existingLicense = await License.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { admin_id: userId },
          { assigned_email: email },
        ],
        status: "active",
        is_active: true,
      },
    });

    if (existingLicense) {
      return res.status(400).json({ status: false, message: "You already have an active license" });
    }

    // Activate license
    await license.update({
      admin_id: userId,
      assigned_email: email,
      status: "active",
      is_active: true,
    });

    return res.status(200).json({ status: true, message: "License activated successfully" });
  } catch (error) {
    console.error("License activation unexpected error:", error);
    return res.status(500).json({
      status: false,
      message: "An unexpected error occurred during license activation",
    });
  }
};

// POST /api/license/validate
exports.validateLicense = async (req, res) => {
  try {
    const email = getEmailFromToken(req);
    if (!email) {
      return res.status(401).json({ status: false, valid: false, message: "Authentication required" });
    }

    const user = await User.findOne({ where: { email_id: email } });

    let license;
    if (user && user.userType === "admin") {
      license = await License.findOne({
        where: {
          admin_id: user.id,
          is_active: true,
          [db.Sequelize.Op.or]: [
            { expiry_date: null },
            { expiry_date: { [db.Sequelize.Op.gt]: new Date() } },
          ],
        },
      });
    } else {
      license = await License.findOne({
        where: {
          assigned_email: email,
          status: "active",
          is_active: true,
          [db.Sequelize.Op.or]: [
            { expiry_date: null },
            { expiry_date: { [db.Sequelize.Op.gt]: new Date() } },
          ],
        },
      });
    }

    const isValid = !!license;
    return res.status(200).json({
      status: true,
      valid: isValid,
      message: isValid ? "License is valid" : "No active license found",
    });
  } catch (error) {
    console.error("License validation error:", error.message);
    return res.status(500).json({
      status: false,
      valid: false,
      message: "An error occurred during license validation",
    });
  }
};

// POST /api/license/verify (no auth required)
exports.verifyLicense = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ valid: false, message: "Request body is required" });
    }

    const { licenseKey } = req.body;
    if (!licenseKey || typeof licenseKey !== "string" || licenseKey.trim() === "") {
      return res.status(400).json({ valid: false, message: "License key is required" });
    }

    const key = licenseKey.trim().toUpperCase();
    const license = await License.findOne({ where: { license_key: key } });

    if (!license) {
      return res.status(200).json({ valid: false, message: "License key not found" });
    }

    if (!license.is_active) {
      return res.status(200).json({ valid: false, message: "License is inactive" });
    }

    if (license.expiry_date) {
      const now = new Date();
      if (now > new Date(license.expiry_date)) {
        return res.status(200).json({ valid: false, message: "License has expired" });
      }
    }

    return res.status(200).json({ valid: true, message: "License is valid" });
  } catch (error) {
    console.error("License verification error:", error.message);
    return res.status(500).json({ valid: false, message: "An error occurred during license verification" });
  }
};

// GET /api/license/generate
exports.generateLicense = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "superadmin") {
      return res.status(403).json({
        status: false,
        message: "SuperAdmin access required. Only SuperAdmin can generate licenses.",
      });
    }

    const { expiryDate } = req.query;
    let licenseKey, isUnique = false, attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      licenseKey = generateLicenseKey();
      const existing = await License.findOne({ where: { license_key: licenseKey } });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ status: false, message: "Failed to generate unique license key" });
    }

    let expiryDateValue = null;
    if (expiryDate) {
      const parsed = new Date(expiryDate + "T23:59:59");
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          status: false,
          message: "Invalid expiry date format. Use YYYY-MM-DD",
        });
      }
      expiryDateValue = parsed;
    }

    await License.create({
      license_key: licenseKey,
      status: "unused",
      is_active: true,
      expiry_date: expiryDateValue,
    });

    return res.status(200).json({
      status: true,
      license_key: licenseKey,
      expiry_date: expiryDateValue,
      message: "License key generated successfully",
    });
  } catch (error) {
    console.error("License generation error:", error.message);
    return res.status(500).json({ status: false, message: "An error occurred during license generation" });
  }
};

// GET /api/license/all
exports.getAllLicenses = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: false, message: "Authentication required" });
    }

    const isSuperAdminUser = req.user.userType === "superadmin";
    const isAdminUser = req.user.userType === "admin";

    if (!isSuperAdminUser && !isAdminUser) {
      return res.status(403).json({ status: false, message: "Admin or SuperAdmin access required" });
    }

    let licenses;
    if (isSuperAdminUser) {
      licenses = await License.findAll({ order: [["createdAt", "DESC"]] });
    } else {
      licenses = await License.findAll({
        where: { admin_id: req.user.id },
        order: [["createdAt", "DESC"]],
      });
    }

    return res.status(200).json({
      status: true,
      data: licenses,
      message: "Licenses retrieved successfully",
    });
  } catch (error) {
    console.error("Get all licenses error:", error.message);
    return res.status(500).json({ status: false, message: "An error occurred while retrieving licenses" });
  }
};

// PUT /api/license/toggle/:id
exports.toggleLicenseStatus = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "superadmin") {
      return res.status(403).json({
        status: false,
        message: "SuperAdmin access required. Only SuperAdmin can toggle license status.",
      });
    }

    const { id } = req.params;
    const licenseId = parseInt(id);
    if (!licenseId) {
      return res.status(400).json({ status: false, message: "Valid license ID is required" });
    }

    const license = await License.findByPk(licenseId);
    if (!license) {
      return res.status(404).json({ status: false, message: "License not found" });
    }

    const newStatus = !license.is_active;
    await license.update({ is_active: newStatus });

    return res.status(200).json({
      status: true,
      is_active: newStatus,
      message: `License ${newStatus ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Toggle license status error:", error.message);
    return res.status(500).json({ status: false, message: "An error occurred while updating license status" });
  }
};

// PUT /api/license/expiry/:id
exports.updateExpiryDate = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "superadmin") {
      return res.status(403).json({
        status: false,
        message: "SuperAdmin access required. Only SuperAdmin can update license expiry dates.",
      });
    }

    const { id } = req.params;
    const { expiryDate } = req.body;

    const licenseId = parseInt(id);
    if (!licenseId) {
      return res.status(400).json({ status: false, message: "Valid license ID is required" });
    }

    let expiryDateValue = null;
    if (expiryDate) {
      const parsed = new Date(expiryDate + "T23:59:59");
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          status: false,
          message: "Invalid expiry date format. Use YYYY-MM-DD",
        });
      }
      expiryDateValue = parsed;
    }

    const license = await License.findByPk(licenseId);
    if (!license) {
      return res.status(404).json({ status: false, message: "License not found" });
    }

    await license.update({ expiry_date: expiryDateValue });

    return res.status(200).json({
      status: true,
      expiry_date: expiryDateValue,
      message: "Expiry date updated successfully",
    });
  } catch (error) {
    console.error("Update expiry date error:", error.message);
    return res.status(500).json({ status: false, message: "An error occurred while updating expiry date" });
  }
};