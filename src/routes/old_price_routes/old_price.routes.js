const express = require("express")

const router = express.Router()
const authenticate = require("../../middleware/authorize")

const { add_old_pricing, get_all_old_pricing, update_old_pricing, delete_old_pricing, get_old_pricing_by_id } = require("../../controller/old_price_controller/old_price.controller")

router.post("/add_old_pricing" , authenticate, add_old_pricing)
router.get("/get_all_old_pricing", authenticate, get_all_old_pricing)
router.patch("/update_old_pricing/:id", authenticate, update_old_pricing)
router.delete("/delete_old_pricing/:id", authenticate, delete_old_pricing)
router.get("/get_old_pricing_by_id/:id" , authenticate, get_old_pricing_by_id)
module.exports = router