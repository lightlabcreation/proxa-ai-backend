const express = require("express")
const { add_price_comparison, get_all_price_comparisons, update_price_comparison, delete_price_comparison } = require("../../controller/price_comparioson_controller/price_comparison.controller")
const authenticate = require("../../middleware/authorize")

const router = express.Router()


router.post("/add_price_comparison" , authenticate, add_price_comparison)
router.get("/get_all_price_comparisons", authenticate, get_all_price_comparisons)
router.patch("/update_price_comparison/:id", authenticate, update_price_comparison)
router.delete("/delete_price_comparison/:id", authenticate, delete_price_comparison)
module.exports = router