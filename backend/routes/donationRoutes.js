const express = require("express");
const Donation = require("../models/Donation");
const Request = require("../models/Request");

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

// Create donation
router.post("/", async (req, res) => {
  try {
    const donation = new Donation(req.body);
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