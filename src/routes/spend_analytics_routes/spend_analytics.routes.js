const express = require("express");
const { get_spends_details, get_dashboard_spends_analytics } = require("../../controller/spend_analytics_controller/spend_analytics.controller");
const authenticate = require("../../middleware/authorize");
const router = express.Router();
router.get("/get_spends_details" , authenticate, get_spends_details)
router.get("/get_dashboard_spends_analytics" , authenticate, get_dashboard_spends_analytics)

module.exports = router;