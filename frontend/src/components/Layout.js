import { Outlet, Link } from 'react-router-dom';
import AiChatbotWidget from './AiChatbotWidget';
import { useAuth } from '../context/AuthContext'; // Import the hook
import '../global.css';

const Layout = () => {
  const { user, logout, loginAs } = useAuth(); // Pull the current user state

  return (
    <div className="app-container">
      {/* 1. Global Navigation Bar */}
      <nav className="global-navbar">
        <div className="logo">SharePlate</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/map">Map</Link> {/* Map is usually public for transparency */}

          {/* Conditional Rendering based on Role */}
          {user?.role === 'donator' && <Link to="/donate">Donate</Link>}
          {user?.role === 'requester' && <Link to="/request">Request</Link>}
          {user?.role === 'volunteer' && <Link to="/volunteer">Volunteer</Link>}
        </div>

        <div className="auth-links">
           {user ? (
             <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
               <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                 Logged in as: {user.role}
               </span>
               <button onClick={logout} className="btn-logout">Logout</button>
             </div>
           ) : (
             <Link to="/login">Login / Register</Link>
           )}
        </div>
      </nav>

      {/* --- TEMPORARY DEV TOOL FOR YOUR PRESENTATION --- */}
      {/* Delete this entire div once Member 1 finishes the real login page */}
      {!user && (
        <div style={{ background: '#333', color: 'white', padding: '10px', textAlign: 'center' }}>
          <small style={{ marginRight: '15px' }}>CA2 Presentation Demo Tools:</small>
          <button onClick={() => loginAs('donator')} style={{ marginRight: '10px' }}>Login as Donator</button>
          <button onClick={() => loginAs('requester')} style={{ marginRight: '10px' }}>Login as Requester</button>
          <button onClick={() => loginAs('volunteer')}>Login as Volunteer</button>
        </div>
      )}

      {/* 2. Dynamic Content Area */}
      <main className="main-content">
        <Outlet /> 
      </main>

      {/* 3. Global Footer Upgrade */}
      <footer className="global-footer">
        <div className="footer-container">
          
          {/* Column 1: Brand */}
          <div className="footer-brand">
            <h3>SharePlate</h3>
            <p>Bridging the gap between surplus and scarcity in Singapore. Deliver hope, one meal at a time.</p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-links">
            <h4>Platform</h4>
            <Link to="/">Home</Link>
            <Link to="/map">Interactive Map</Link>
            <Link to="/donate">Donate Surplus</Link>
            <Link to="/request">Request Assistance</Link>
            <Link to="/volunteer">Volunteer Hub</Link>
          </div>

          {/* Column 3: Support */}
          <div className="footer-links">
            <h4>Support</h4>
            <Link to="/about">About Us</Link>
            <Link to="#">How it Works</Link>
            <Link to="#">Contact Us</Link>
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Terms of Service</Link>
          </div>

          {/* Column 4: Social Media */}
          <div className="footer-socials">
            <h4>Connect</h4>
            <div className="social-icons">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">📸 Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">📘 Facebook</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">💼 LinkedIn</a>
            </div>
          </div>

        </div>
        
        {/* Copyright Banner */}
        <div className="footer-bottom">
          <p>&copy; 2026 LaunchLab Team 1. All rights reserved.</p>
        </div>
      </footer>

      {/* 4. AI Chatbot */}
      <AiChatbotWidget />
    </div>
  );
};

export default Layout;