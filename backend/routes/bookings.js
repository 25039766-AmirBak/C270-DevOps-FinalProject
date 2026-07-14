const express = require('express');
const router = express.Router();
const VolunteerBooking = require('../models/VolunteerBooking');
const FamilyLocation = require('../models/FamilyLocation');

// POST /api/bookings - create a new volunteer slot booking
router.post('/', async (req, res) => {
  try {
    const { volunteerName, volunteerEmail, date, timeSlot, familyLocationId } = req.body;

    if (!volunteerName || !volunteerEmail || !date || !timeSlot || !familyLocationId) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const location = await FamilyLocation.findById(familyLocationId);
    if (!location) {
      return res.status(404).json({ error: 'Selected location was not found.' });
    }

    // Prevent double-booking: same location, date, and time slot already taken
    const existing = await VolunteerBooking.findOne({
      familyLocation: familyLocationId,
      date: new Date(date),
      timeSlot,
      status: 'Confirmed'
    });
    if (existing) {
      return res.status(409).json({ error: 'This slot has already been booked by someone else.' });
    }

    const booking = await VolunteerBooking.create({
      volunteerName,
      volunteerEmail,
      date: new Date(date),
      timeSlot,
      familyLocation: familyLocationId,
      familyAddress: location.address,
      status: 'Confirmed'
    });

    res.status(201).json({ message: 'Booking confirmed', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings?date=YYYY-MM-DD - list bookings for a given date
// (used by the schedule page to mark slots as already taken)
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'A date query parameter is required.' });
    }

    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const bookings = await VolunteerBooking.find({
      date: { $gte: start, $lt: end },
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id - fetch one booking (used by the confirmation page)
router.get('/:id', async (req, res) => {
  try {
    const booking = await VolunteerBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
