// Ahmad
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true
    },
    foodName: {
      type: String,
      required: true
    },
    quantityRemaining: {
      type: Number,
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    message: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Request", requestSchema);