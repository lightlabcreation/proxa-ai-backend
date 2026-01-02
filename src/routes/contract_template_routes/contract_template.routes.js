const express = require("express")

const router = express.Router()
const {uploads} = require("../../middleware/multer")
const authenticate = require("../../middleware/authorize")
const { add_contract_template, get_all_contract_templates, update_contract_template, delete_contract_template } = require("../../controller/contract_template_controller/contract_template.controller")


router.post("/add_contract_template" , authenticate, uploads.single("customAgreementFile"), add_contract_template)
router.get("/get_all_contract_templates" , authenticate, get_all_contract_templates)
router.patch("/update_contract_template/:id", authenticate, update_contract_template)
router.delete("/delete_contract_template/:id", authenticate, delete_contract_template)
module.exports = router