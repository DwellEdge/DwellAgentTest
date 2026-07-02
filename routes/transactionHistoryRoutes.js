const express = require("express");

const router = express.Router();

const {
  createTransaction,
  getTransactions,
  getPreviousAgents,
} = require("../controllers/transactionHistoryController");

router.post("/", createTransaction);

router.get("/previous-agents", getPreviousAgents);

router.get("/", getTransactions);

module.exports = router;