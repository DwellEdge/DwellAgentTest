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
