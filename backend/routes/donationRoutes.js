const express = require("express");
const Donation = require("../models/Donation");

const router = express.Router();

// Get all donations
router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve donations",
      error: error.message
    });
  }
});

// Create donation with validation features 
router.post("/", async (req, res) => {
  try {
    const { foodName, quantity, location, expiryDate } = req.body;

    if (!foodName || foodName.trim().length < 2) {
      return res.status(400).json({ message: "Food name must be at least 2 characters." });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0." });
    }

    if (!location || location.trim().length < 3) {
      return res.status(400).json({ message: "Location must be at least 3 characters." });
    }

    if (!expiryDate) {
      return res.status(400).json({ message: "Expiry date is required." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedExpiryDate = new Date(expiryDate);

    if (selectedExpiryDate < today) {
      return res.status(400).json({ message: "Expiry date cannot be before today." });
    }

    const donation = new Donation({
      foodName: foodName.trim(),
      quantity: Number(quantity),
      location: location.trim(),
      expiryDate
    });

    const savedDonation = await donation.save();

    res.status(201).json(savedDonation);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create donation",
      error: error.message
    });
  }
});

module.exports = router;