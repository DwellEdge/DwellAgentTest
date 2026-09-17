<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const { createProperty, getProperties } = require('../controllers/propertyController');

router.post('/', createProperty);
router.get('/', getProperties);

module.exports = router;
=======
const express = require("express");
const router = express.Router();
const { addProperty, getPropertiesByAgent } = require("../controllers/propertyController");

router.post("/", addProperty);
router.get("/:agentId", getPropertiesByAgent);

module.exports = router;
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726
