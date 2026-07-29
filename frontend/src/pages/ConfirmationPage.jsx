import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBooking } from '../services/volunteerService';
import '../styles/volunteer.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function ConfirmationPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBooking(bookingId)
      .then(setBooking)
      .catch(() => setError('Could not find this booking. It may have been cancelled.'));
  }, [bookingId]);

  return (
    <div className="confirmation-page-container">
      {error && (
        <div className="confirmation-card error-card">
          <h1>We couldn't load that booking</h1>
          <p>{error}</p>
          <Link to="/volunteer" className="btn btn-primary">Try Booking Again</Link>
        </div>
      )}

      {!error && !booking && <p className="status-msg">Loading your confirmation…</p>}

      {booking && (
        <div className="confirmation-card">
          <div className="confirmation-badge">✓</div>
          <h1>Your slot is confirmed</h1>
          <p className="confirmation-sub">
            Thank you, {booking.volunteerName} — this delivery is now locked in.
            A confirmation email is on its way to {booking.volunteerEmail}.
          </p>

          <div className="confirmation-details">
            <div className="detail-row">
              <span className="detail-label">Date</span>
              <span className="detail-value">{formatDate(booking.date)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time slot</span>
              <span className="detail-value">{booking.timeSlot}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Delivery address</span>
              <span className="detail-value">{booking.familyAddress}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value status-pill">{booking.status}</span>
            </div>
          </div>

          <Link to="/" className="btn btn-secondary">Back to Home</Link>
        </div>
      )}
    </div>
  );
}

export default ConfirmationPage;
