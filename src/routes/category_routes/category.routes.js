const express = require("express");
const { add_category, get_categories } = require("../../controller/category_controller.js/category.controller");
const { add_subcategory, get_sub_categories } = require("../../controller/category_controller.js/subCategory.controller");
const authenticate = require("../../middleware/authorize");
const router = express.Router();
router.post("/add_category", authenticate, add_category)
router.get("/get_categories" ,authenticate, get_categories)
router.post("/add_subcategory",authenticate , add_subcategory)
router.get("/get_sub_categories" , get_sub_categories)
module.exports = router;