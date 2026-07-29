const mongoose = require('mongoose');

// A volunteer's booked delivery slot, linked to a FamilyLocation.
const volunteerBookingSchema = new mongoose.Schema({
  volunteerName: { type: String, required: true },
  volunteerEmail: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: {
    type: String,
    enum: ['Morning (9am - 12pm)', 'Afternoon (1pm - 4pm)', 'Evening (5pm - 8pm)'],
    required: true
  },
  familyLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyLocation',
    required: true
  },
  familyAddress: { type: String, required: true }, // denormalized copy for easy display
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Completed'],
    default: 'Confirmed'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VolunteerBooking', volunteerBookingSchema, 'volunteerBookings');
