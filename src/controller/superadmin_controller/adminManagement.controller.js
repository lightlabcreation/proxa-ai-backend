const pool = require("../../utils/mysql2Connection");
const crypto = require("crypto");

/**
 * CREATE ADMIN + LICENSE
 * Only Super Admin
 */
exports.createAdmin = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { name, email, password, expiry_date } = req.body;

    if (!name || !email || !password || !expiry_date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await connection.beginTransaction();

    // Check existing user
    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Admin already exists" });
    }

    // Create admin user
    const [userResult] = await connection.execute(
      `INSERT INTO users (name, email, password, userType, is_active)
       VALUES (?, ?, ?, 'admin', 1)`,
      [name, email, password]
    );

    const adminId = userResult.insertId;

    // Generate license key
    const licenseKey = crypto.randomBytes(20).toString("hex");

    // Create license
    await connection.execute(
      `INSERT INTO licenses
       (admin_id, license_key, assigned_email, status, is_active, expiry_date)
       VALUES (?, ?, ?, 'active', 1, ?)`,
      [adminId, licenseKey, email, expiry_date]
    );

    await connection.commit();

    res.status(201).json({
      message: "Admin created successfully",
      license_key: licenseKey
    });

  } catch (error) {
    await connection.rollback();
    console.error("Create admin error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    connection.release();
  }
};

/**
 * GET ALL ADMINS WITH LICENSE
 */
exports.getAllAdmins = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.is_active,
        l.license_key,
        l.status,
        l.expiry_date
      FROM users u
      LEFT JOIN licenses l ON l.admin_id = u.id
      WHERE u.userType = 'admin'
      ORDER BY u.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Get admins error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * TOGGLE ADMIN ACTIVE / INACTIVE
 */
exports.toggleAdminStatus = async (req, res) => {
  try {
    const { admin_id } = req.params;

    const [admins] = await pool.execute(
      "SELECT is_active FROM users WHERE id = ? AND userType = 'admin'",
      [admin_id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const newStatus = admins[0].is_active === 1 ? 0 : 1;

    await pool.execute(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [newStatus, admin_id]
    );

    res.json({
      message: "Admin status updated",
      is_active: newStatus
    });

  } catch (error) {
    console.error("Toggle admin error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET EXPIRING LICENSES (next 7 days)
 */
exports.getExpiringLicenses = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.name,
        u.email,
        l.license_key,
        l.expiry_date
      FROM licenses l
      JOIN users u ON u.id = l.admin_id
      WHERE l.is_active = 1
      AND l.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `);

    res.json(rows);
  } catch (error) {
    console.error("Expiring licenses error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * RENEW LICENSE
 */
exports.renewLicense = async (req, res) => {
  try {
    const { license_id, new_expiry_date } = req.body;

    if (!license_id || !new_expiry_date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await pool.execute(
      "UPDATE licenses SET expiry_date = ? WHERE id = ?",
      [new_expiry_date, license_id]
    );

    res.json({ message: "License renewed successfully" });

  } catch (error) {
    console.error("Renew license error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
