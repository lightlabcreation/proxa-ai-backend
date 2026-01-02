const express = require("express")

const router = express.Router()

const {uploads} = require("../../middleware/multer")
const { add_intake_request, get_all_intake_requests, update_intake_request, delete_intake_request, intake_dashboard, add_comment, updatestatus, get_intake_request_by_id, update_request, get_all_not_pending_intake_requests, get_intake_request_details } = require("../../controller/intake_management_controller/intake_management.controller")
const authenticate = require("../../middleware/authorize")


router.get("/intake_dashboard" , authenticate, intake_dashboard)
router.get("/get_all_not_pending_intake_requests", authenticate, get_all_not_pending_intake_requests)
router.post("/add_intake_request" ,   uploads.fields([
    { name: "contractDocument", maxCount: 1 },
    { name: "intakeAttachment", maxCount: 1 },
  ]),authenticate,
add_intake_request)
router.get("/get_all_intake_requests", authenticate, get_all_intake_requests)
router.patch("/update_intake_request/:id",authenticate, update_intake_request)
router.delete("/delete_intake_request/:id", authenticate, delete_intake_request)
router.post("/add_comment" ,authenticate , add_comment)
router.patch("/updatestatus/:id", authenticate, updatestatus)
router.get("/get_intake_request_by_id/:id", authenticate, get_intake_request_by_id)
router.patch('/update_request/:id', authenticate, uploads.fields([
  { name: 'contractDocument', maxCount: 1 },
  { name: 'reqAttachMentfile', maxCount: 1 },
  { name: 'intakeAttachment', maxCount: 1 }
]), update_request);
router.get("/get_intake_request_details", authenticate, get_intake_request_details)

module.exports = router