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
  propertyTypes: [
    {
      propertyTypeId: String,
      propertyType: String,
      count: Number,
    }
  ]
});

module.exports = mongoose.model("Agent", agentSchema, "Agents");