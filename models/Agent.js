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

  // new registration fields
  officeAddress: String,
  homeAddress: String,
  email: { type: String, unique: true, sparse: true },
  mobileNumber: String,
  photo: String,       // file path
  idDocument: String,  // file path
  password: String,    // hashed

  propertyTypes: [
    {
      propertyTypeId: String,
      propertyType: String,
      count: Number,
    },
  ],

  "Number of Property": String,

  createdDateAndTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Agent", agentSchema, "Agents");