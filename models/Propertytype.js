const mongoose = require("mongoose");

const propertyTypeSchema = new mongoose.Schema({
  propertyTypeId: String,
  propertyType: String,
});

module.exports = mongoose.model("PropertyType", propertyTypeSchema, "PropertyTypes");