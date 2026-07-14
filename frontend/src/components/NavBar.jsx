import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  return (
    <nav className="nav-bar">
      <Link to="/" className="nav-logo">
        Share<span>Plate</span>
      </Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/schedule" className="nav-cta">Volunteer Now</Link>
      </div>
    </nav>
  );
}

export default NavBar;
