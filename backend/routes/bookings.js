// Yong Xian
const express = require('express');
const router = express.Router();
const VolunteerBooking = require('../models/VolunteerBooking');
const FamilyLocation = require('../models/FamilyLocation');
const { sendBookingConfirmationEmail } = require('../utils/mailer');

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

    // Fire off the confirmation email. This never throws — a mail outage
    // should never prevent the booking itself from succeeding.
    sendBookingConfirmationEmail(booking);

    res.status(201).json({ message: 'Booking confirmed', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings?date=YYYY-MM-DD&email=... - list bookings
// - date only: used by the schedule page to mark slots as already taken
// - email only: used by the My Bookings page to list a volunteer's own bookings
// - both: bookings for that volunteer on that date
router.get('/', async (req, res) => {
  try {
    const { date, email } = req.query;

    if (!date && !email) {
      return res.status(400).json({ error: 'A date or email query parameter is required.' });
    }

    const query = {};

    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    if (email) {
      // Case-insensitive exact match on the email the volunteer booked with
      query.volunteerEmail = new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    const bookings = await VolunteerBooking.find(query)
      .populate('familyLocation', 'address area')
      .sort({ date: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/cancel - cancel a booking (frees up the slot again)
router.patch('/:id/cancel', async (req, res) => {
  try {
    const booking = await VolunteerBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status === 'Cancelled') {
      return res.status(200).json({ message: 'Booking already cancelled', booking });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({ message: 'Booking cancelled', booking });
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
