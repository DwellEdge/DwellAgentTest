const express = require("express");

const router = express.Router();

console.log("✅ messageRoutes Loaded");

const {
  sendMessage,
} = require("../controllers/messageController");

router.post("/send-message", (req, res, next) => {
  console.log("✅ /api/send-message HIT");
  next();
}, sendMessage);

module.exports = router;