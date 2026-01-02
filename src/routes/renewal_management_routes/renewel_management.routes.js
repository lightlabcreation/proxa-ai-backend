const express = require("express")

const router = express.Router()
const {uploads} = require("../../middleware/multer")
const authorize = require("../../middleware/authorize")
const { add_renewal_request, get_all_renewal_requests, update_renewal_request, delete_renewal_request } = require("../../controller/renewal_management_controller/renewal_management.controller")

router.post("/add_renewal_request" ,uploads.single("renewalAttachmentFile"),authorize , add_renewal_request)
router.get("/get_all_renewal_requests",get_all_renewal_requests)
router.patch("/update_renewal_request/:id", update_renewal_request)
router.delete("/delete_renewal_request/:id",delete_renewal_request)
module.exports = router