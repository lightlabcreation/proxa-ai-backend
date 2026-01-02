const express = require("express");
const { get_dashboard_data } = require("../../controller/dashboard_controller/dashboard.controller");
const { getAllDataByOrganisaton } = require("../../controller/chatBoatController/getAllData");
const authenticate = require("../../middleware/authorize");
const router = express.Router();
router.get("/get_dashboard_data" , authenticate, get_dashboard_data)
router.get("/getAllDataByOrganisaton" , authenticate, getAllDataByOrganisaton )
module.exports = router;
