const express = require("express");
const { add_transaction, get_all_transactions, update_transaction, delete_transaction } = require("../../controller/transaction_controller/transaction.controller");
const authenticate = require("../../middleware/authorize")
const router = express.Router();
router.post("/add_transaction" , authenticate,add_transaction)
router.get("/get_all_transactions" , authenticate, get_all_transactions)
router.patch("/update_transaction/:id" , authenticate, update_transaction)
router.delete("/delete_transaction/:id" , authenticate, delete_transaction)
module.exports = router;