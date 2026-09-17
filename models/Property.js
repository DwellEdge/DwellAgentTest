const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  agentId: { type: String, default: null },
  propertyAvailableFor: String,
  propertyCost: { type: Number, default: 0 },
  propertyAddress: String,
  area: String,
  city: String,
  pinCode: String,
  facing: String,
  propertyType: String,
  carParking: Boolean,
  twoWheelerParking: Boolean,
  amenities: Object,
  security: Boolean,
  landmark: String,
  media: {
    images: [String],
    videos: [String],
  },
  listedDate: { type: Date, default: Date.now },
  expiryDate: Date,
}, {
  collection: 'PropertyDetails',
});

module.exports = mongoose.model('Property', PropertySchema, 'PropertyDetails');
