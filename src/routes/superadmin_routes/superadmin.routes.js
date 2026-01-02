// const express = require("express");
// const router = express.Router();
// const authenticate = require("../../middleware/authorize");
// const superAdminOnly = require("../../middleware/superAdminOnly");
// const {
//   createAdmin,
//   getAllAdmins,
//   renewLicense,
//   toggleAdmin,
//   updateExpiry,
//   getExpiringLicenses,
//   getMyAdminData
// } = require("../../controller/superadmin_controller/adminManagement.controller");

// // All SuperAdmin routes require authentication AND SuperAdmin role
// router.post("/superadmin/create-admin", authenticate, superAdminOnly, createAdmin);
// router.get("/superadmin/admins", authenticate, superAdminOnly, getAllAdmins);
// router.put("/superadmin/renew-license/:adminId", authenticate, superAdminOnly, renewLicense);
// router.put("/superadmin/toggle-admin/:adminId", authenticate, superAdminOnly, toggleAdmin);
// router.put("/superadmin/update-expiry/:adminId", authenticate, superAdminOnly, updateExpiry);
// router.get("/superadmin/expiring-licenses", authenticate, superAdminOnly, getExpiringLicenses);

// // Admin route - get own data only (separate from SuperAdmin routes)
// router.get("/admin/my-data", authenticate, getMyAdminData);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createAdmin,
  getAllAdmins,
  toggleAdminStatus,
  getExpiringLicenses,
  renewLicense
} = require("../../controllers/admin/adminController");

const authenticate = require("../../middleware/authenticate");
const superAdminOnly = require("../../middleware/superAdminOnly");

// Admin management
router.post("/create", authenticate, superAdminOnly, createAdmin);
router.get("/list", authenticate, superAdminOnly, getAllAdmins);
router.patch("/toggle/:admin_id", authenticate, superAdminOnly, toggleAdminStatus);

// License
router.get("/licenses/expiring", authenticate, superAdminOnly, getExpiringLicenses);
router.post("/licenses/renew", authenticate, superAdminOnly, renewLicense);

module.exports = router;


