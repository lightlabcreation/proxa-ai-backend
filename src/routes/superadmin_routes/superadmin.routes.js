// const express = require("express");
// const router = express.Router();
// const authenticate = require("../../middleware/authorize");


// const {
//   createAdmin,
//   getAllAdmins,
//   renewLicense,
//   toggleAdmin,
//   updateExpiry,       // now properly imported
//   getExpiringLicenses,
//   getMyAdminData
// } = require("../../controller/superadmin_controller/adminManagement.controller");

// // SuperAdmin routes
// router.post("/superadmin/create-admin", authenticate,  createAdmin);
// router.get("/superadmin/admins", authenticate, , getAllAdmins);
// router.put("/superadmin/renew-license/:adminId", authenticate,  renewLicense);
// router.put("/superadmin/toggle-admin/:adminId", authenticate,  toggleAdmin);
// router.put("/superadmin/update-expiry/:adminId", authenticate,  updateExpiry);
// router.get("/superadmin/expiring-licenses", authenticate,  getExpiringLicenses);

// // Admin route - get own data
// router.get("/admin/my-data", authenticate, getMyAdminData);

// module.exports = router;



const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/authorize");
const {
  createAdmin,
  getAllAdmins,
  renewLicense,
  toggleAdmin,
  updateExpiry,
  getExpiringLicenses,
  getMyAdminData
} = require("../../controller/superadmin_controller/adminManagement.controller");

// SuperAdmin routes (auth + controller handles role check)
router.post("/superadmin/create-admin", authenticate, createAdmin);
router.get("/superadmin/admins", authenticate, getAllAdmins);
router.put("/superadmin/renew-license/:adminId", authenticate, renewLicense);
router.put("/superadmin/toggle-admin/:adminId", authenticate, toggleAdmin);
router.put("/superadmin/update-expiry/:adminId", authenticate, updateExpiry);
router.get("/superadmin/expiring-licenses", authenticate, getExpiringLicenses);

// Admin self-data route
router.get("/admin/my-data", authenticate, getMyAdminData);

module.exports = router;