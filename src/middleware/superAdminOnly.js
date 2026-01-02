/**
 * SuperAdmin Only Middleware
 * Blocks all non-SuperAdmin users from accessing SuperAdmin routes
 */
const superAdminOnly = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required'
      });
    }

    // Strict check - must be SuperAdmin
    if (req.user.userType !== 'superadmin') {
      return res.status(403).json({
        status: false,
        message: 'SuperAdmin access required. You do not have permission to access this resource.'
      });
    }

    // User is SuperAdmin, allow access
    next();
  } catch (error) {
    console.error('SuperAdmin middleware error:', error);
    return res.status(500).json({
      status: false,
      message: 'Error validating SuperAdmin access'
    });
  }
};

module.exports = superAdminOnly;

