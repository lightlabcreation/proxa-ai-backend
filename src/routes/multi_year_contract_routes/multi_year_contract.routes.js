const express = require("express")
const { add_multi_year_contract, get_all_multi_year_contracts, update_multi_year_contract, delete_multi_year_contract, get_multi_year_contract_by_id } = require("../../controller/multi_year_contracting_controller/multi_year_contracting.controller")
const authenticate = require("../../middleware/authorize")
const router = express.Router()


router.post("/add_multi_year_contract" , authenticate,add_multi_year_contract)
router.get("/get_all_multi_year_contracts", authenticate, get_all_multi_year_contracts)
router.patch("/update_multi_year_contract/:id", authenticate, update_multi_year_contract)
router.delete("/delete_multi_year_contract/:id", authenticate, delete_multi_year_contract)

router.get("/get_multi_year_contract_by_id/:id", authenticate, get_multi_year_contract_by_id)

module.exports = router