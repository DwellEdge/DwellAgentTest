const mongoose = require("mongoose");

const transactionHistorySchema =
  new mongoose.Schema({
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    city: String,

    area: String,

    customerId: Number,

    noOfAgentsSelected: Number,

    agentIds: [String],

    propertyType: String,

    mobileNumber: String,

    amountReceived: Number,

    createdDateAndTime: {
      type: Date,
      default: Date.now,
    },
  });

module.exports = mongoose.model(
  "TransactionHistory",
  transactionHistorySchema,
  "TransactionHistory"
);