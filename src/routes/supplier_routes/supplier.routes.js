const express = require("express");
const { add_supplier, get_all_suppliers, update_supplier, delete_supplier, assign_intake_request, delete_assign_intake_request } = require("../../controller/supplier_controller/supplier.controller");
const { add_rating, get_ratings } = require("../../controller/supplier_controller/supplier_performance.controller");
const authenticate = require("../../middleware/authorize")
const router = express.Router();
router.post("/add_supplier" ,authenticate ,add_supplier)
router.get("/get_all_suppliers" , authenticate, get_all_suppliers)
router.patch("/update_supplier/:id" , authenticate, update_supplier)
router.delete("/delete_supplier/:id" , authenticate, delete_supplier)
router.post("/assign_intake_request" ,authenticate,assign_intake_request )
router.delete("/delete_assign_intake_request/:id" ,delete_assign_intake_request)

router.post("/add_rating" ,authenticate, add_rating)
router.post("/get_ratings" , get_ratings)

module.exports = router;