// Yong Xian
const express = require('express');
const router = express.Router();
const FamilyLocation = require('../models/FamilyLocation');

// GET /api/locations - list of family locations (address + area only)
router.get('/', async (req, res) => {
  try {
    const locations = await FamilyLocation.find().sort({ area: 1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
