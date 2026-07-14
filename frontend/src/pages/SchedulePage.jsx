import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getFamilyLocations, getBookingsForDate, createBooking } from '../api';
import './SchedulePage.css';

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
  const [week] = useState(buildWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));

  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState('');

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
          .map((b) => `${b.familyLocation}|${b.timeSlot}`)
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
    if (!volunteerName.trim() || !volunteerEmail.trim()) {
      setFormError('Enter your name and email above before booking a slot.');
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
      navigate(`/confirmation/${booking._id}`);
    } catch (err) {
      setFormError(err.message);
      setBookingKey(null);
    }
  };

  return (
    <div className="schedule-page">
      <NavBar />

      <div className="schedule-header">
        <div>
          <span className="eyebrow">Volunteer Schedule</span>
          <h1>Pick a date, then a slot</h1>
        </div>
      </div>

      <div className="volunteer-id-form">
        <div className="form-row">
          <label htmlFor="volunteerName">Your name</label>
          <input
            id="volunteerName"
            type="text"
            value={volunteerName}
            onChange={(e) => setVolunteerName(e.target.value)}
            placeholder="e.g. Au Yong Xian"
          />
        </div>
        <div className="form-row">
          <label htmlFor="volunteerEmail">Your email</label>
          <input
            id="volunteerEmail"
            type="email"
            value={volunteerEmail}
            onChange={(e) => setVolunteerEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
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
