
const express = require("express");
const { createCostSaving } = require("../../controller/costSaving_controller/costSaving.controller");
const router = express.Router();
router.post("/createCostSaving" , createCostSaving)
module.exports = router;
