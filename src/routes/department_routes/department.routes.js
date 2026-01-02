const express = require("express")
const { add_department, get_all_departments, update_department, delete_department, get_department_by_id, add_department_flow } = require("../../controller/department_controller/department.controller")
const authenticate = require("../../middleware/authorize")
const router = express.Router()

router.post("/add_department" , authenticate , add_department)
router.get("/get_all_departments" ,authenticate, get_all_departments)
router.patch("/update_department/:id", authenticate, update_department)
router.delete("/delete_department/:id", authenticate, delete_department)
router.get("/get_department_by_id/:id" , authenticate ,get_department_by_id)
router.post("/add_department_flow",authenticate,add_department_flow)
module.exports = router