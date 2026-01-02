const express = require("express");
const { get_all_volume_discounts } = require("../../controller/volume_discount_controller/volume_discount.controller");
const authenticate = require("../../middleware/authorize");
const router = express.Router();
router.get("/get_all_volume_discounts", authenticate, get_all_volume_discounts)
// router.patch("/update_volume_discount/:id" , update_volume_discount)
// router.delete("/delete_volume_discount/:id" ,delete_volume_discount)
module.exports = router;