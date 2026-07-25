import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFamilyLocations, getBookingsForDate, createBooking } from '../services/volunteerService';
import '../styles/volunteer.css';

const TIME_SLOTS = [
  { key: 'Morning (9am - 12pm)', label: 'Morning', className: 'morning' },
  { key: 'Afternoon (1pm - 4pm)', label: 'Afternoon', className: 'afternoon' },
  { key: 'Evening (5pm - 8pm)', label: 'Evening', className: 'evening' },
];

function buildWeek(startDate) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

function SchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // The volunteer's name and email come straight from their logged-in
  // account, so there's no manual entry on this page.
  const volunteerName = user?.name || '';
  const volunteerEmail = user?.email || '';

  const [week] = useState(buildWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));

  const [locations, setLocations] = useState([]);
  const [takenSlots, setTakenSlots] = useState(new Set()); // "locationId|timeSlot"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingKey, setBookingKey] = useState(null); // which card is currently submitting
  const [formError, setFormError] = useState(null);

  const loadData = useCallback(async (dateKey) => {
    setLoading(true);
    setError(null);
    try {
      const [locs, bookings] = await Promise.all([
        getFamilyLocations(),
        getBookingsForDate(dateKey),
      ]);
      setLocations(locs);
      const taken = new Set(
        bookings
          .filter((b) => b.status === 'Confirmed')
          .map((b) => `${b.familyLocation?._id || b.familyLocation}|${b.timeSlot}`)
      );
      setTakenSlots(taken);
    } catch (err) {
      setError('Could not load the schedule. Is the backend running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate, loadData]);

  const handleBook = async (locationId, timeSlot) => {
    setFormError(null);

    if (!volunteerName || !volunteerEmail) {
      setFormError('We could not detect your account details. Please log in again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const key = `${locationId}|${timeSlot}`;
    setBookingKey(key);
    try {
      const booking = await createBooking({
        volunteerName,
        volunteerEmail,
        date: selectedDate,
        timeSlot,
        familyLocationId: locationId,
      });
      navigate(`/volunteer/confirmation/${booking._id}`);
    } catch (err) {
      setFormError(err.message);
      setBookingKey(null);
    }
  };

  return (
    <div className="volunteer-page-container">
      <div className="volunteer-header">
        <span className="eyebrow">Volunteer Schedule</span>
        <h1>Pick a date, then a slot</h1>
        <p>Choose a delivery date and time that works for you — we'll email you a confirmation once it's booked.</p>
      </div>

      <div className="volunteer-identity">
        <div>
          <p className="identity-label">Booking as</p>
          <p className="identity-value">
            {volunteerName || 'Unknown volunteer'}
            <span className="identity-email">{volunteerEmail}</span>
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/volunteer/my-bookings')}>
          My Bookings
        </button>
      </div>

      {formError && <p className="status-msg error">{formError}</p>}

      <div className="date-selector">
        {week.map((d) => {
          const key = toISODate(d);
          const isActive = key === selectedDate;
          return (
            <button
              key={key}
              className={`date-chip ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedDate(key)}
            >
              <span className="date-num">{String(d.getDate()).padStart(2, '0')}</span>
              <span className="date-label">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </button>
          );
        })}
      </div>

      {loading && <p className="status-msg">Loading slots…</p>}
      {error && <p className="status-msg error">{error}</p>}
      {!loading && !error && locations.length === 0 && (
        <p className="status-msg">No family locations are set up yet.</p>
      )}

      {!loading && !error && locations.map((loc) => (
        <div className="location-section" key={loc._id}>
          <h2>{loc.area} — {loc.address}</h2>
          <div className="slot-cards">
            {TIME_SLOTS.map((slot) => {
              const key = `${loc._id}|${slot.key}`;
              const isTaken = takenSlots.has(key);
              const isSubmitting = bookingKey === key;
              return (
                <div className={`slot-card ${slot.className}`} key={slot.key}>
                  <span className="slot-name">{slot.label}</span>
                  <span className="slot-status">{isTaken ? 'Booked' : 'Available'}</span>
                  <button
                    className="book-btn"
                    disabled={isTaken || isSubmitting}
                    onClick={() => handleBook(loc._id, slot.key)}
                  >
                    {isSubmitting ? 'Booking…' : 'Book'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SchedulePage;
