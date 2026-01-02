const express = require("express")

const router = express.Router()
const {uploads} = require("../../middleware/multer");
const { add_contract_type, get_all_contract_types, update_contract_type, delete_contract_type } = require("../../controller/contract_management_controller/contract_type.controller");


router.post("/add_contract_type" , add_contract_type)
router.get('/get_all_contract_types', get_all_contract_types);
router.patch('/update_contract_type/:id', update_contract_type);
router.delete('/delete_contract_type/:id', delete_contract_type);
module.exports = router