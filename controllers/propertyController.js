<<<<<<< HEAD
const Property = require('../models/Property');

const createProperty = async (req, res) => {
  try {
    const payload = req.body || {};
    const normalized = {
      ...payload,
      agentId: payload.agentId || null,
      propertyCost: Number(payload.propertyCost) || 0,
      carParking: Boolean(payload.carParking),
      twoWheelerParking: Boolean(payload.twoWheelerParking),
      security: Boolean(payload.security),
      media: {
        images: Array.isArray(payload.media?.images) ? payload.media.images : [],
        videos: Array.isArray(payload.media?.videos) ? payload.media.videos : [],
      },
    };

    console.log('createProperty payload:', normalized);
    const property = await Property.create(normalized);
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    console.error('Error creating property:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProperties = async (req, res) => {
  try {
    const props = await Property.find().sort({ listedDate: -1 });
    res.json(props);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createProperty, getProperties };
=======
const PropertyDetails = require("../models/PropertyDetails");
const Agent = require("../models/Agent");
const client = require("../services/twilioService");

const addProperty = async (req, res) => {
  try {
    const {
      agentId,
      propertyAvailableFor,
      propertyCost,
      propertyAddress,
      area,
      city,
      pinCode,
      facing,
      propertyType,
      carParking,
      twoWheelerParking,
      amenities,
      landmark,
    } = req.body;

    // Save the property first
    const property = await PropertyDetails.create({
      agentId,
      propertyAvailableFor,
      propertyCost,
      propertyAddress,
      area,
      city,
      pinCode,
      facing,
      propertyType,
      carParking: carParking || false,
      twoWheelerParking: twoWheelerParking || false,
      amenities: amenities || {},
      landmark: landmark || "",
    });

    // Respond to frontend immediately
    res.status(201).json({ success: true, data: property });

    // Send SMS after responding so it never blocks the frontend
    try {
      const agent = await Agent.findOne({ agentId }).lean();
      console.log("Agent found for SMS:", agent ? agent.firstName : "NOT FOUND");

      if (agent && agent.mobileNumber) {
        const smsMessage =
          `Hi ${agent.firstName}, your property has been successfully registered on DwellAgent!\n\n` +
          `Property Details:\n` +
          `Available For: ${propertyAvailableFor}\n` +
          `Cost: Rs.${Number(propertyCost).toLocaleString()}\n` +
          `Address: ${propertyAddress}, ${area}, ${city} - ${pinCode}\n` +
          `Your listing will be visible to customers for 90 days.\n\n` +
          `Thank you for using DwellAgent!`;

        await client.messages.create({
          body: smsMessage,
          from: process.env.TWILIO_PHONE,
          to: `+91${agent.mobileNumber}`,
        });
        console.log(`Property registration SMS sent to +91${agent.mobileNumber}`);
      } else {
        console.log("SMS skipped — agent not found or no mobile number. agentId:", agentId);
      }
    } catch (smsErr) {
      console.error("Property SMS send error:", smsErr.message);
    }

  } catch (error) {
    console.error("Add property error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPropertiesByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const properties = await PropertyDetails.find({
      agentId,
      expiryDate: { $gt: new Date() },
    }).lean();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addProperty, getPropertiesByAgent };
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726
