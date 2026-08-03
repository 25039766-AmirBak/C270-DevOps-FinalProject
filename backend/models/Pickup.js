// Yong Xian
const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true
    },

    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    pickupStatus: {
      type: String,
      enum: ["Assigned", "In Progress", "Completed"],
      default: "Assigned"
    },

    pickupTime: {
      type: Date
    },

    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Pickup", pickupSchema);