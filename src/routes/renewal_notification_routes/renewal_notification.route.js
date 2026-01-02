const express = require("express")

const router = express.Router()
const { add_notification } = require("../../controller/renewal_notification_controller/renewal_notification.controller")


router.post("/add_notification" , add_notification)
module.exports = router