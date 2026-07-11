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

    const foodNameRegex = /^[A-Za-z\s]+$/;
    const quantityRegex = /^[1-9][0-9]*$/;
    const locationHasLetterRegex = /[A-Za-z]/;

    const foodNameValue = String(foodName || "").trim();
    const quantityValue = String(quantity || "").trim();
    const locationValue = String(location || "").trim();

    // Food Name validation
    if (!foodNameValue) {
      return res.status(400).json({ message: "Food name is required." });
    }

    if (foodNameValue.length < 2) {
      return res.status(400).json({ message: "Food name must be at least 2 characters." });
    }

    if (!foodNameRegex.test(foodNameValue)) {
      return res.status(400).json({
        message: "Food name cannot contain numbers or special characters."
      });
    }

    // Quantity validation
    if (!quantityValue) {
      return res.status(400).json({ message: "Quantity is required." });
    }

    if (!quantityRegex.test(quantityValue)) {
      return res.status(400).json({
        message: "Quantity must contain numbers only and must be greater than 0."
      });
    }

    // Location validation
    if (!locationValue) {
      return res.status(400).json({ message: "Location is required." });
    }

    if (locationValue.length < 3) {
      return res.status(400).json({ message: "Location must be at least 3 characters." });
    }

    if (!locationHasLetterRegex.test(locationValue)) {
      return res.status(400).json({
        message: "Location cannot be numbers only."
      });
    }

    // Expiry Date validation
    if (!expiryDate) {
      return res.status(400).json({ message: "Expiry date is required." });
    }

    const selectedExpiryDate = new Date(expiryDate);

    if (isNaN(selectedExpiryDate.getTime())) {
      return res.status(400).json({ message: "Expiry date is invalid." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedExpiryDate.setHours(0, 0, 0, 0);

    if (selectedExpiryDate < today) {
      return res.status(400).json({
        message: "Expiry date cannot be before today."
      });
    }

    const donation = new Donation({
      foodName: foodNameValue,
      quantity: Number(quantityValue),
      location: locationValue,
      expiryDate: selectedExpiryDate,
      status: "Available"
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