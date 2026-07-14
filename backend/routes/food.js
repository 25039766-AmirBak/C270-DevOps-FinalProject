const express = require('express');
const router = express.Router();
const FoodDonation = require('../models/FoodDonation');

// GET /api/food - all currently available food donations
router.get('/', async (req, res) => {
  try {
    const food = await FoodDonation.find({ status: 'Available' }).sort({ expiryDate: 1 });
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
