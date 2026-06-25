const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    unique: true,
  },

  firstName: String,

  lastName: String,

  city: String,

  area: String,

  address: String,

  mobileNumber: String,

  propertyCount: Number,

  propertyTypeId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(
  "Agent",
  agentSchema,
  "Agents"
);