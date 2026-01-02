const pool = require('../../utils/mysql2Connection');
const jwt = require('jsonwebtoken');
const accessSecretKey = process.env.ACCESS_SECRET_KEY;

/**
 * Generate a random license key in format: APP-XXXX-YYYY-ZZZZ
 */
function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like I, O, 0, 1
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
 * Extract email from JWT token
 */
function getEmailFromToken(req) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    
    const decoded = jwt.verify(token, accessSecretKey);
    return decoded.email || null;
  } catch (error) {
    return null;
  }
}

/**
 * POST /api/license/activate
 * Activates a license key for the current user's email
 */
exports.activateLicense = async (req, res) => {
  let connection = null;
  try {
    // Debug log (for troubleshooting only)
    console.log('License activation request body:', JSON.stringify(req.body));
    
    // Validate request body exists
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        status: false,
        message: 'Request body is required'
      });
    }

    const { licenseKey } = req.body;
    
    // Validate licenseKey exists and is not null/undefined
    if (!licenseKey || typeof licenseKey !== 'string' || licenseKey.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'License key is required'
      });
    }
    
    // Get email from token
    const email = getEmailFromToken(req);
    if (!email) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required'
      });
    }

    // Validate license key format
    const trimmedLicenseKey = licenseKey.trim().toUpperCase();
    const licenseKeyPattern = /^APP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!licenseKeyPattern.test(trimmedLicenseKey)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid license key format. Expected format: APP-XXXX-YYYY-ZZZZ'
      });
    }

    // Get database connection
    try {
      connection = await pool.getConnection();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({
        status: false,
        message: 'Database connection failed. Please try again later.'
      });
    }
    
    // Check if license exists
    let licenses;
    try {
      [licenses] = await connection.execute(
        'SELECT * FROM licenses WHERE license_key = ?',
        [trimmedLicenseKey]
      );
    } catch (queryError) {
      console.error('License query error:', queryError);
      return res.status(500).json({
        status: false,
        message: 'Error checking license. Please try again later.'
      });
    }

    if (!licenses || licenses.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Invalid license key'
      });
    }

    const license = licenses[0];
    if (!license) {
      return res.status(404).json({
        status: false,
        message: 'Invalid license key'
      });
    }

    // Get user info to check if license is already assigned to this admin
    let user;
    try {
      const db = require('../../config/config');
      const User = db.user;
      if (!User) {
        throw new Error('User model not found');
      }
      user = await User.findOne({ where: { email_id: email } });
    } catch (userError) {
      console.error('User lookup error:', userError);
      return res.status(500).json({
        status: false,
        message: 'Error validating user. Please try again later.'
      });
    }
    
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Convert admin_id to number for comparison (handle both string and number)
    const licenseAdminId = license.admin_id ? parseInt(license.admin_id) : null;
    const userId = user.id ? parseInt(user.id) : null;

    // If license is already assigned to this admin (via admin_id), return success
    if (licenseAdminId && licenseAdminId === userId) {
      // License is already assigned to this admin
      const isActive = license.is_active === 1 || license.is_active === true || license.is_active === '1';
      const isStatusActive = license.status === 'active';
      
      if (isStatusActive && isActive) {
        return res.status(200).json({
          status: true,
          message: 'License is already active for your account'
        });
      }
      
      // Update to active if it was inactive
      try {
        await connection.execute(
          'UPDATE licenses SET assigned_email = ?, status = ?, is_active = TRUE, updated_at = NOW() WHERE license_key = ?',
          [email, 'active', trimmedLicenseKey]
        );
        return res.status(200).json({
          status: true,
          message: 'License activated successfully'
        });
      } catch (updateError) {
        console.error('License update error:', updateError);
        return res.status(500).json({
          status: false,
          message: 'Error activating license. Please try again later.'
        });
      }
    }

    // If license has admin_id but it's a different admin, reject
    if (licenseAdminId && licenseAdminId !== userId) {
      return res.status(400).json({
        status: false,
        message: 'This license is already assigned to another admin'
      });
    }

    // If license status is not 'unused' and not assigned to this admin, reject
    if (license.status && license.status !== 'unused') {
      return res.status(400).json({
        status: false,
        message: 'Invalid or already used key'
      });
    }

    // Check if user already has an active license (by admin_id or assigned_email)
    let existingLicenses;
    try {
      [existingLicenses] = await connection.execute(
        `SELECT * FROM licenses 
         WHERE (admin_id = ? OR assigned_email = ?) 
         AND status = 'active' 
         AND is_active = TRUE`,
        [userId, email]
      );
    } catch (existingQueryError) {
      console.error('Existing license query error:', existingQueryError);
      return res.status(500).json({
        status: false,
        message: 'Error checking existing licenses. Please try again later.'
      });
    }

    if (existingLicenses && existingLicenses.length > 0) {
      return res.status(400).json({
        status: false,
        message: 'You already have an active license'
      });
    }

    // Activate the license (set admin_id, assigned_email, status, and is_active)
    try {
      await connection.execute(
        'UPDATE licenses SET admin_id = ?, assigned_email = ?, status = ?, is_active = TRUE, updated_at = NOW() WHERE license_key = ?',
        [userId, email, 'active', trimmedLicenseKey]
      );

      return res.status(200).json({
        status: true,
        message: 'License activated successfully'
      });
    } catch (activateError) {
      console.error('License activation update error:', activateError);
      return res.status(500).json({
        status: false,
        message: 'Error activating license. Please try again later.'
      });
    }

  } catch (error) {
    // Catch any unexpected errors
    console.error('License activation unexpected error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      status: false,
      message: 'An unexpected error occurred during license activation'
    });
  } finally {
    // Always release connection if it was acquired
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing database connection:', releaseError);
      }
    }
  }
};

/**
 * POST /api/license/validate
 * Validates if the current user has an active license
 * Note: This endpoint doesn't require a request body, email is extracted from JWT token
 */
exports.validateLicense = async (req, res) => {
  let connection;
  try {
    // Get email from token (no body required)
    const email = getEmailFromToken(req);
    if (!email) {
      return res.status(401).json({
        status: false,
        valid: false,
        message: 'Authentication required'
      });
    }

    connection = await pool.getConnection();

    // Check for active license linked to admin_id (preferred) or assigned_email
    // First try to find user by email to get admin_id
    const db = require('../../config/config');
    const User = db.user;
    const user = await User.findOne({ where: { email_id: email } });
    
    let licenses;
    if (user && user.userType === 'admin') {
      // Check license by admin_id
      [licenses] = await connection.execute(
        `SELECT * FROM licenses 
         WHERE admin_id = ? 
         AND is_active = TRUE 
         AND (expiry_date IS NULL OR expiry_date > NOW())`,
        [user.id]
      );
    } else {
      // Fallback to assigned_email check
      [licenses] = await connection.execute(
        `SELECT * FROM licenses 
         WHERE assigned_email = ? 
         AND status = ? 
         AND is_active = TRUE 
         AND (expiry_date IS NULL OR expiry_date > NOW())`,
        [email, 'active']
      );
    }

    const isValid = licenses.length > 0;

    return res.status(200).json({
      status: true,
      valid: isValid,
      message: isValid ? 'License is valid' : 'No active license found'
    });

  } catch (error) {
    console.error('License validation error:', error.message);
    return res.status(500).json({
      status: false,
      valid: false,
      message: 'An error occurred during license validation'
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Check if user is admin
 */
function isAdmin(req) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return false;
    
    const token = authHeader.split(' ')[1];
    if (!token) return false;
    
    const decoded = jwt.verify(token, accessSecretKey);
    return decoded.type === 'admin' || decoded.type === 'superadmin';
  } catch (error) {
    return false;
  }
}

/**
 * POST /api/license/verify
 * Verifies a license key (used by software)
 * Request: { "licenseKey": "STRING" }
 * Checks: exists, is_active, not expired
 */
exports.verifyLicense = async (req, res) => {
  let connection;
  try {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        valid: false,
        message: 'Request body is required'
      });
    }

    const { licenseKey } = req.body;
    
    if (!licenseKey || typeof licenseKey !== 'string' || licenseKey.trim() === '') {
      return res.status(400).json({
        valid: false,
        message: 'License key is required'
      });
    }

    connection = await pool.getConnection();

    // Check if license exists
    const [licenses] = await connection.execute(
      'SELECT * FROM licenses WHERE license_key = ?',
      [licenseKey.trim().toUpperCase()]
    );

    if (licenses.length === 0) {
      return res.status(200).json({
        valid: false,
        message: 'License key not found'
      });
    }

    const license = licenses[0];

    // Check if license is active
    if (!license.is_active) {
      return res.status(200).json({
        valid: false,
        message: 'License is inactive'
      });
    }

    // Check if license is expired
    if (license.expiry_date) {
      const expiryDate = new Date(license.expiry_date);
      const now = new Date();
      if (now > expiryDate) {
        return res.status(200).json({
          valid: false,
          message: 'License has expired'
        });
      }
    }

    return res.status(200).json({
      valid: true,
      message: 'License is valid'
    });

  } catch (error) {
    console.error('License verification error:', error.message);
    return res.status(500).json({
      valid: false,
      message: 'An error occurred during license verification'
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * GET /api/license/generate
 * Generates a new unused license key (SuperAdmin only)
 * Query params: expiryDate (optional, format: YYYY-MM-DD)
 */
exports.generateLicense = async (req, res) => {
  let connection;
  try {
    // Strict check - must be SuperAdmin
    if (!req.user || req.user.userType !== 'superadmin') {
      return res.status(403).json({
        status: false,
        message: 'SuperAdmin access required. Only SuperAdmin can generate licenses.'
      });
    }

    const { expiryDate } = req.query; // Optional expiry date

    connection = await pool.getConnection();

    // Generate unique license key
    let licenseKey;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      licenseKey = generateLicenseKey();
      const [existing] = await connection.execute(
        'SELECT * FROM licenses WHERE license_key = ?',
        [licenseKey]
      );
      if (existing.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        status: false,
        message: 'Failed to generate unique license key'
      });
    }

    // Validate expiry date format if provided
    let expiryDateValue = null;
    if (expiryDate) {
      const parsedDate = new Date(expiryDate + 'T23:59:59'); // Set to end of day
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          status: false,
          message: 'Invalid expiry date format. Use YYYY-MM-DD'
        });
      }
      expiryDateValue = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    // Insert new license
    await connection.execute(
      'INSERT INTO licenses (license_key, status, is_active, expiry_date, created_at) VALUES (?, ?, ?, ?, NOW())',
      [licenseKey, 'unused', true, expiryDateValue]
    );

    return res.status(200).json({
      status: true,
      license_key: licenseKey,
      expiry_date: expiryDateValue,
      message: 'License key generated successfully'
    });

  } catch (error) {
    console.error('License generation error:', error.message);
    return res.status(500).json({
      status: false,
      message: 'An error occurred during license generation'
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * GET /api/license/all
 * Get licenses (role-based access)
 * - SuperAdmin: sees all licenses
 * - Admin: sees only their own license
 */
exports.getAllLicenses = async (req, res) => {
  let connection = null;
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required'
      });
    }

    // Check if SuperAdmin or Admin
    const isSuperAdminUser = req.user.userType === 'superadmin';
    const isAdminUser = req.user.userType === 'admin';

    if (!isSuperAdminUser && !isAdminUser) {
      return res.status(403).json({
        status: false,
        message: 'Admin or SuperAdmin access required'
      });
    }

    try {
      connection = await pool.getConnection();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({
        status: false,
        message: 'Database connection failed. Please try again later.'
      });
    }

    let licenses;
    if (isSuperAdminUser) {
      // SuperAdmin sees all licenses
      try {
        [licenses] = await connection.execute(
          'SELECT id, license_key, assigned_email, admin_id, status, is_active, expiry_date, created_at, updated_at FROM licenses ORDER BY created_at DESC'
        );
      } catch (queryError) {
        console.error('Query error:', queryError);
        return res.status(500).json({
          status: false,
          message: 'Error fetching licenses. Please try again later.'
        });
      }
    } else {
      // Admin sees only their own license
      try {
        [licenses] = await connection.execute(
          'SELECT id, license_key, assigned_email, admin_id, status, is_active, expiry_date, created_at, updated_at FROM licenses WHERE admin_id = ? ORDER BY created_at DESC',
          [req.user.id]
        );
      } catch (queryError) {
        console.error('Query error:', queryError);
        return res.status(500).json({
          status: false,
          message: 'Error fetching your license. Please try again later.'
        });
      }
    }

    return res.status(200).json({
      status: true,
      data: licenses || [],
      message: 'Licenses retrieved successfully'
    });

  } catch (error) {
    console.error('Get all licenses error:', error.message);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving licenses'
    });
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
};

/**
 * PUT /api/license/toggle/:id
 * Toggle license active status (admin-only)
 */
exports.toggleLicenseStatus = async (req, res) => {
  let connection = null;
  try {
    // Strict check - must be SuperAdmin
    if (!req.user || req.user.userType !== 'superadmin') {
      return res.status(403).json({
        status: false,
        message: 'SuperAdmin access required. Only SuperAdmin can toggle license status.'
      });
    }

    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        status: false,
        message: 'Valid license ID is required'
      });
    }

    try {
      connection = await pool.getConnection();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({
        status: false,
        message: 'Database connection failed. Please try again later.'
      });
    }

    // Get current license
    let licenses;
    try {
      [licenses] = await connection.execute(
        'SELECT * FROM licenses WHERE id = ?',
        [id]
      );
    } catch (queryError) {
      console.error('Query error:', queryError);
      return res.status(500).json({
        status: false,
        message: 'Error fetching license. Please try again later.'
      });
    }

    if (!licenses || licenses.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'License not found'
      });
    }

    const license = licenses[0];
    const newStatus = !license.is_active;

    // Update license status
    try {
      await connection.execute(
        'UPDATE licenses SET is_active = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, id]
      );
    } catch (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({
        status: false,
        message: 'Error updating license status. Please try again later.'
      });
    }

    return res.status(200).json({
      status: true,
      is_active: newStatus,
      message: `License ${newStatus ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Toggle license status error:', error.message);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while updating license status'
    });
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
};

/**
 * PUT /api/license/expiry/:id
 * Update license expiry date (SuperAdmin only)
 */
exports.updateExpiryDate = async (req, res) => {
  let connection = null;
  try {
    // Strict check - must be SuperAdmin
    if (!req.user || req.user.userType !== 'superadmin') {
      return res.status(403).json({
        status: false,
        message: 'SuperAdmin access required. Only SuperAdmin can update license expiry dates.'
      });
    }

    const { id } = req.params;
    const { expiryDate } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        status: false,
        message: 'Valid license ID is required'
      });
    }

    // Validate expiry date if provided
    let expiryDateValue = null;
    if (expiryDate) {
      const parsedDate = new Date(expiryDate + 'T23:59:59'); // Set to end of day
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          status: false,
          message: 'Invalid expiry date format. Use YYYY-MM-DD'
        });
      }
      expiryDateValue = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    try {
      connection = await pool.getConnection();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({
        status: false,
        message: 'Database connection failed. Please try again later.'
      });
    }

    // Check if license exists
    let licenses;
    try {
      [licenses] = await connection.execute(
        'SELECT * FROM licenses WHERE id = ?',
        [id]
      );
    } catch (queryError) {
      console.error('Query error:', queryError);
      return res.status(500).json({
        status: false,
        message: 'Error fetching license. Please try again later.'
      });
    }

    if (!licenses || licenses.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'License not found'
      });
    }

    // Update expiry date
    try {
      await connection.execute(
        'UPDATE licenses SET expiry_date = ?, updated_at = NOW() WHERE id = ?',
        [expiryDateValue, id]
      );
    } catch (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({
        status: false,
        message: 'Error updating expiry date. Please try again later.'
      });
    }

    return res.status(200).json({
      status: true,
      expiry_date: expiryDateValue,
      message: 'Expiry date updated successfully'
    });

  } catch (error) {
    console.error('Update expiry date error:', error.message);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while updating expiry date'
    });
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
};

