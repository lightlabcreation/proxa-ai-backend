const express = require("express")

const router = express.Router()
const { uploads } = require("../../middleware/multer");
const { get_all_approvers_request, update_approver_request, delete_approver_request, create_approver_request, approver_flow } = require("../../controller/approval_controller/approval_controller");

router.post("/create_approver_request", create_approver_request)
router.get("/get_all_approvers_request", get_all_approvers_request)
router.patch("/update_approver_request/:id", update_approver_request)
router.delete("/delete_approver_request/:id", delete_approver_request)
router.get("/approver_flow/:id",approver_flow)
module.exports = router