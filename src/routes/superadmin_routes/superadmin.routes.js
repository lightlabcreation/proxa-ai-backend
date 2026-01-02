const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/authorize");
const superAdminOnly = require("../../middleware/superAdminOnly");
const {
  createAdmin,
  getAllAdmins,
  renewLicense,
  toggleAdmin,
  updateExpiry,
  getExpiringLicenses,
  getMyAdminData
} = require("../../controller/superadmin_controller/adminManagement.controller");

// All SuperAdmin routes require authentication AND SuperAdmin role
router.post("/superadmin/create-admin", authenticate, superAdminOnly, createAdmin);
router.get("/superadmin/admins", authenticate, superAdminOnly, getAllAdmins);
router.put("/superadmin/renew-license/:adminId", authenticate, superAdminOnly, renewLicense);
router.put("/superadmin/toggle-admin/:adminId", authenticate, superAdminOnly, toggleAdmin);
router.put("/superadmin/update-expiry/:adminId", authenticate, superAdminOnly, updateExpiry);
router.get("/superadmin/expiring-licenses", authenticate, superAdminOnly, getExpiringLicenses);

// Admin route - get own data only (separate from SuperAdmin routes)
router.get("/admin/my-data", authenticate, getMyAdminData);

module.exports = router;

