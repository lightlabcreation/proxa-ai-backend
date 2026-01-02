// // const pool = require('../../utils/mysql2Connection');
// // const jwt = require('jsonwebtoken');
// // const accessSecretKey = process.env.ACCESS_SECRET_KEY;

// // /**
// //  * License Validation Middleware
// //  * Checks if Admin user has valid license (SuperAdmin bypasses this check)
// //  */
// // const validateLicense = async (req, res, next) => {
// //   try {
// //     // Get user from request (set by authenticate middleware)
// //     const user = req.user;
    
// //     if (!user) {
// //       return res.status(401).json({
// //         status: false,
// //         message: 'Authentication required'
// //       });
// //     }

// //     // SuperAdmin never needs license - allow access
// //     if (user.userType === 'superadmin') {
// //       return next();
// //     }

// //     // Admin users must have valid license
// //     if (user.userType === 'admin') {
// //       const connection = await pool.getConnection();
      
// //       try {
// //         // Check for active license linked to this admin
// //         const [licenses] = await connection.execute(
// //           `SELECT * FROM licenses 
// //            WHERE admin_id = ? 
// //            AND is_active = TRUE 
// //            AND (expiry_date IS NULL OR expiry_date > NOW())`,
// //           [user.id]
// //         );

// //         if (licenses.length === 0) {
// //           return res.status(403).json({
// //             status: false,
// //             message: 'Valid license required. Your license may be expired or inactive.',
// //             requiresLicense: true
// //           });
// //         }

// //         // License is valid, proceed
// //         return next();
// //       } catch (error) {
// //         console.error('License validation error:', error.message);
// //         return res.status(500).json({
// //           status: false,
// //           message: 'Error validating license'
// //         });
// //       } finally {
// //         connection.release();
// //       }
// //     }

// //     // For other user types, allow access (no license required)
// //     return next();
// //   } catch (error) {
// //     console.error('License validation middleware error:', error.message);
// //     return res.status(500).json({
// //       status: false,
// //       message: 'Error validating license'
// //     });
// //   }
// // };

// // module.exports = validateLicense;



// const { License } = require("../../config/config");

// /**
//  * License Validation Middleware
//  * Checks if Admin user has valid license (SuperAdmin bypasses this check)
//  */
// const validateLicense = async (req, res, next) => {
//   try {
//     // Get user from request (set by authenticate middleware)
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({
//         status: false,
//         message: "Authentication required",
//       });
//     }

//     // SuperAdmin never needs license - allow access
//     if (user.userType === "superadmin") {
//       return next();
//     }

//     // Admin users must have valid license
//     if (user.userType === "admin") {
//       const license = await License.findOne({
//         where: {
//           admin_id: user.id,
//           is_active: true,
//           // expiry_date is null OR expiry_date > NOW()
//           [Sequelize.Op.or]: [
//             { expiry_date: null },
//             { expiry_date: { [Sequelize.Op.gt]: new Date() } },
//           ],
//         },
//       });

//       if (!license) {
//         return res.status(403).json({
//           status: false,
//           message:
//             "Valid license required. Your license may be expired or inactive.",
//           requiresLicense: true,
//         });
//       }

//       // License is valid, proceed
//       return next();
//     }

//     // For other user types, allow access (no license required)
//     return next();
//   } catch (error) {
//     console.error("License validation middleware error:", error.message);
//     return res.status(500).json({
//       status: false,
//       message: "Error validating license",
//     });
//   }
// };

// module.exports = validateLicense;



const db = require("../../config/config");
const License = db.license;

/**
 * License Validation Middleware
 * Checks if Admin user has valid license (SuperAdmin bypasses this check)
 */
const validateLicense = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Authentication required"
      });
    }

    // SuperAdmin doesn't need a license
    if (user.userType === "superadmin") {
      return next();
    }

    // Admin must have active, non-expired license
    if (user.userType === "admin") {
      const license = await License.findOne({
        where: {
          admin_id: user.id,
          is_active: true,
          [db.Sequelize.Op.or]: [
            { expiry_date: null },
            { expiry_date: { [db.Sequelize.Op.gt]: new Date() } }
          ]
        }
      });

      if (!license) {
        return res.status(403).json({
          status: false,
          message: "Valid license required. Your license may be expired or inactive.",
          requiresLicense: true
        });
      }

      return next();
    }

    // Other user types (if any) — no license check
    return next();
  } catch (error) {
    console.error("License validation middleware error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Error validating license"
    });
  }
};

module.exports = validateLicense;