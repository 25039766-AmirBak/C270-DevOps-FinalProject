const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    foodName: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    expiryDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["Available", "Requested", "Picked Up"],
      default: "Available"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Donation", donationSchema);