const express = require("express");
const { add_service_sow_consolidation, get_all_service_sow_consolidations, update_service_sow_consolidation, delete_service_sow_consolidation, get_service_sow_consolidation_by_id } = require("../../controller/sow_consolidation_controller/sow_consolidation.controller");
const authenticate = require("../../middleware/authorize");
const router = express.Router();
router.post("/add_service_sow_consolidation" , authenticate, add_service_sow_consolidation)
router.get("/get_all_service_sow_consolidations" , authenticate, get_all_service_sow_consolidations)
router.patch("/update_service_sow_consolidation/:id" , authenticate, update_service_sow_consolidation)
router.delete("/delete_service_sow_consolidation/:id" , authenticate, delete_service_sow_consolidation)

router.get("/get_service_sow_consolidation_by_id/:id" , authenticate, get_service_sow_consolidation_by_id)

module.exports = router;