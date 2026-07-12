const mongoose = require('mongoose');

// This matches the existing "donations" collection structure
// (foodName, quantity, location, expiryDate, status) seen in Atlas.
const foodDonationSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Collected', 'Expired'],
    default: 'Available'
  }
});

module.exports = mongoose.model('FoodDonation', foodDonationSchema, 'donations');
