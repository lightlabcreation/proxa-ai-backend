const express = require("express");
const { add_supplier_consolidation, get_all_supplier_consolidations, update_supplier_consolidation, delete_supplier_consolidation } = require("../../controller/supplier_consolidation_controller/supplier_consolidation.controller");
const authenticate = require("../../middleware/authorize");
const router = express.Router();
router.post("/add_supplier_consolidation" , authenticate, add_supplier_consolidation)
router.get("/get_all_supplier_consolidations" , authenticate, get_all_supplier_consolidations)
router.patch("/update_supplier_consolidation/:id" , authenticate, update_supplier_consolidation)
router.delete("/delete_supplier_consolidation/:id" , authenticate, delete_supplier_consolidation)
module.exports = router;