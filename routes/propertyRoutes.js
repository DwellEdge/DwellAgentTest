const express = require('express');
const router = express.Router();
const { createProperty, getProperties } = require('../controllers/propertyController');

router.post('/', createProperty);
router.get('/', getProperties);

module.exports = router;
