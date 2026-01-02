const express = require("express")
const router = express.Router()
const {uploads} = require("../../middleware/multer")
const authenticate = require("../../middleware/authorize")
const { add_contract, get_all_contracts, delete_contract, get_contracts_dashboard, update_contract } = require("../../controller/contract_management_controller/contract_management.controller")

router.get("/get_contracts_dashboard" , authenticate, get_contracts_dashboard)
router.post("/add_contract" ,uploads.single("contractAttachmentFile"), authenticate ,  add_contract)
router.patch("/update_contract/:id" , authenticate, update_contract)
router.get("/get_all_contracts", authenticate, get_all_contracts)
router.delete("/delete_contract/:id", authenticate, delete_contract)
module.exports = router