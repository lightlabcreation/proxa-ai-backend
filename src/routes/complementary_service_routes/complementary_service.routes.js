const express = require("express")
const { add_complementary_service, get_all_complementary_services, update_complementary_service, delete_complementary_service, get_complementary_service_by_id } = require("../../controller/complementary_service_controller/complementary_service.controller")

const router = express.Router()
const authenticate = require("../../middleware/authorize");

router.post("/add_complementary_service" ,authenticate, add_complementary_service)
router.get("/get_all_complementary_services", authenticate, get_all_complementary_services)
router.patch("/update_complementary_service/:id", authenticate, update_complementary_service)
router.delete("/delete_complementary_service/:id", authenticate, delete_complementary_service)
router.get("/get_complementary_service_by_id/:id", authenticate, get_complementary_service_by_id);

module.exports = router