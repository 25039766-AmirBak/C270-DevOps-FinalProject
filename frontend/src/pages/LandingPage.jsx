import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getAvailableFood } from '../api';
import './LandingPage.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function LandingPage() {
  const [food, setFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAvailableFood()
      .then(setFood)
      .catch(() => setError('Could not load available food. Is the backend running on port 5000?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="landing-page">
      <NavBar />

      <header className="hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">SharePlate Volunteers</span>
          <h1>
            Bridging the gap<br />between <em>surplus</em> and scarcity.
          </h1>
          <p>
            SharePlate connects donated food with volunteers who deliver it
            straight to families who need it most. Pick a slot, choose a
            street, and help close the gap.
          </p>
          <div className="hero-actions">
            <Link to="/schedule" className="btn btn-primary">Become a Volunteer</Link>
            <a href="#available-food" className="btn btn-ghost">See Available Food</a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <svg viewBox="0 0 320 320" className="basket-svg">
            <circle cx="160" cy="150" r="130" fill="#f57c31" opacity="0.18" />
            <g transform="translate(60,90)">
              <path d="M10 60 L190 60 L170 170 Q100 190 30 170 Z" fill="#d9631c" />
              <path d="M10 60 L190 60 L182 90 L18 90 Z" fill="#f57c31" />
              <path d="M60 60 Q100 -10 140 60" fill="none" stroke="#2e7d32" strokeWidth="8" strokeLinecap="round" />
              <circle cx="70" cy="45" r="16" fill="#eef2ec" />
              <circle cx="105" cy="30" r="14" fill="#f7f8f5" />
              <circle cx="135" cy="48" r="15" fill="#f57c31" />
            </g>
          </svg>
        </div>
      </header>

      <section id="available-food" className="food-section">
        <div className="section-heading">
          <span className="eyebrow">Right now</span>
          <h2>Available Food</h2>
          <p>Pulled live from our donation database — first come, first served.</p>
        </div>

        {loading && <p className="status-msg">Loading available food…</p>}
        {error && <p className="status-msg error">{error}</p>}
        {!loading && !error && food.length === 0 && (
          <p className="status-msg">No food is currently listed as available. Check back soon.</p>
        )}

        <div className="food-grid">
          {food.map((item) => (
            <div className="food-card" key={item._id}>
              <div className="food-card-top">
                <h3>{item.foodName}</h3>
                <span className="food-qty">{item.quantity} units</span>
              </div>
              <p className="food-location">📍 {item.location}</p>
              <p className="food-expiry">Best before {formatDate(item.expiryDate)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2>Ready to make a delivery run?</h2>
        <p>Pick a date, a family's street, and a time that works for you.</p>
        <Link to="/schedule" className="btn btn-primary large">Schedule a Slot</Link>
      </section>

      <footer className="footer">
        <p>HarvestShare — a student project for C270 DevOps Essentials.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
