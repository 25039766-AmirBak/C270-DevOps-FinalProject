import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookingsByEmail, cancelBooking } from '../services/volunteerService';
import { fixLeafletIcons, geocodeLocation, getProxyRecipientLabel } from '../utils/mapGeocode';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/volunteer.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function MyBookingsPage() {
  const { user } = useAuth();
  const volunteerEmail = user?.email || '';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const isGeocodingRef = useRef(false);

  const loadBookings = useCallback(async () => {
    if (!volunteerEmail) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBookingsByEmail(volunteerEmail);
      setBookings(data);
    } catch (err) {
      setError('Could not load your bookings. Is the backend running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, [volunteerEmail]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (bookingId) => {
    setActionError(null);
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'Cancelled' } : b))
      );
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingBookings = bookings.filter((b) => b.status === 'Confirmed');
  const pastOrCancelled = bookings.filter((b) => b.status !== 'Confirmed');

  // --- Map: plot every active booking's recipient location ---
  useEffect(() => {
    if (!mapContainerRef.current) return;
    fixLeafletIcons();

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([1.3521, 103.8198], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) mapInstanceRef.current.removeLayer(layer);
    });

    const plotBooking = async (booking) => {
      const area = booking.familyLocation?.area || '';
      const address = booking.familyLocation?.address || booking.familyAddress || '';
      const coords = await geocodeLocation(area) || await geocodeLocation(address);
      if (!coords) return false;

      const recipientLabel = getProxyRecipientLabel(booking.familyLocation?._id || booking.familyLocation);

      L.marker([coords.lat, coords.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div>
            <h4 style="margin: 0 0 5px 0; color: #2E7D32;">${recipientLabel}</h4>
            <p style="margin: 0 0 5px 0; color: #666;">📍 ${address || area}</p>
            <p style="margin: 0 0 5px 0;">🗓️ ${formatDate(booking.date)} — ${booking.timeSlot}</p>
            <p style="margin: 0; font-weight: bold; color: ${booking.status === 'Confirmed' ? '#2E7D32' : '#9CA3AF'};">
              ${booking.status}
            </p>
          </div>
        `);

      return coords.usedApi;
    };

    const loadMarkers = async () => {
      if (isGeocodingRef.current || upcomingBookings.length === 0) return;
      isGeocodingRef.current = true;
      for (let i = 0; i < upcomingBookings.length; i++) {
        const usedApi = await plotBooking(upcomingBookings[i]);
        if (usedApi) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }
      isGeocodingRef.current = false;
    };

    loadMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingBookings.length, bookings]);

  return (
    <div className="volunteer-page-container">
      <div className="volunteer-header">
        <span className="eyebrow">My Bookings</span>
        <h1>Your delivery runs</h1>
        <p>Everything you've booked, plus where each recipient is — so you can plan your route.</p>
      </div>

      <div className="volunteer-identity">
        <div>
          <p className="identity-label">Showing bookings for</p>
          <p className="identity-value">
            {user?.name || 'Unknown volunteer'}
            <span className="identity-email">{volunteerEmail}</span>
          </p>
        </div>
        <Link to="/volunteer" className="btn btn-secondary">Book Another Slot</Link>
      </div>

      {actionError && <p className="status-msg error">{actionError}</p>}
      {loading && <p className="status-msg">Loading your bookings…</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p className="status-msg">
          You haven't booked any slots yet. <Link to="/volunteer">Find a slot to book</Link>.
        </p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <>
          <div className="my-bookings-map-card">
            <h2>Recipient Locations</h2>
            <p className="card-subtitle">
              Pins show where your upcoming deliveries are headed. Names are placeholders —
              recipient identities are kept private, only the street address is shared.
            </p>
            <div ref={mapContainerRef} className="my-bookings-map" />
          </div>

          {upcomingBookings.length > 0 && (
            <div className="location-section">
              <h2>Upcoming</h2>
              <div className="booking-list">
                {upcomingBookings.map((b) => (
                  <div className="booking-card" key={b._id}>
                    <div className="booking-card-main">
                      <span className="status-pill status-confirmed">{b.status}</span>
                      <h3>{formatDate(b.date)} — {b.timeSlot}</h3>
                      <p className="booking-recipient">
                        {getProxyRecipientLabel(b.familyLocation?._id || b.familyLocation)}
                      </p>
                      <p className="booking-address">📍 {b.familyLocation?.address || b.familyAddress}</p>
                    </div>
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancel(b._id)}
                      disabled={cancellingId === b._id}
                    >
                      {cancellingId === b._id ? 'Cancelling…' : 'Cancel Booking'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastOrCancelled.length > 0 && (
            <div className="location-section">
              <h2>Past &amp; Cancelled</h2>
              <div className="booking-list">
                {pastOrCancelled.map((b) => (
                  <div className="booking-card muted" key={b._id}>
                    <div className="booking-card-main">
                      <span className={`status-pill ${b.status === 'Cancelled' ? 'status-cancelled' : ''}`}>
                        {b.status}
                      </span>
                      <h3>{formatDate(b.date)} — {b.timeSlot}</h3>
                      <p className="booking-recipient">
                        {getProxyRecipientLabel(b.familyLocation?._id || b.familyLocation)}
                      </p>
                      <p className="booking-address">📍 {b.familyLocation?.address || b.familyAddress}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyBookingsPage;
