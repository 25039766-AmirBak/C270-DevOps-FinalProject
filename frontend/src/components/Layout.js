import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AiChatbotWidget from './AiChatbotWidget';
import { useAuth } from '../context/AuthContext'; // Import the hook
import '../global.css';

const Layout = () => {
  const { user, logout, loginAs } = useAuth(); 
  
  // --- State to track which checkboxes are ticked ---
  const [demoRoles, setDemoRoles] = useState([]);

  const navigate = useNavigate();

  // --- Custom Logout Handler ---
  const handleLogout = () => {
    navigate('/'); // 1. Move them to the Home page instantly
    
    // 2. Wait just 10 milliseconds for the route to change before erasing data
    setTimeout(() => {
      logout(); 
    }, 10);
  };

  // --- Function to handle checking/unchecking boxes ---
  const handleRoleToggle = (e) => {
    const role = e.target.value;
    if (e.target.checked) {
      setDemoRoles([...demoRoles, role]); // Add role if checked
    } else {
      setDemoRoles(demoRoles.filter((r) => r !== role)); // Remove if unchecked
    }
  };

  // --- Clear checkboxes when user logs out ---
  useEffect(() => {
    if (!user) {
      setDemoRoles([]);
    }
  }, [user]);

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
          {user?.roles?.includes('donator') && <Link to="/donate">Donate</Link>}
          {user?.roles?.includes('requester') && <Link to="/request">Request</Link>}
          {user?.roles?.includes('volunteer') && <Link to="/volunteer">Volunteer</Link>}
        </div>

        <div className="auth-links">
           {user ? (
             <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
               <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                Logged in as: {user?.roles?.join(', ')}
              </span>
               <button onClick={handleLogout} className="btn-logout">Logout</button>
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
          
          <label style={{ marginRight: '15px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              value="donator" 
              checked={demoRoles.includes('donator')} 
              onChange={handleRoleToggle} 
            /> Donator
          </label>
          
          <label style={{ marginRight: '15px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              value="requester" 
              checked={demoRoles.includes('requester')} 
              onChange={handleRoleToggle} 
            /> Requester
          </label>
          
          <label style={{ marginRight: '15px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              value="volunteer" 
              checked={demoRoles.includes('volunteer')} 
              onChange={handleRoleToggle} 
            /> Volunteer
          </label>

          <button 
            onClick={() => loginAs(demoRoles)} 
            disabled={demoRoles.length === 0}
            style={{ 
              background: demoRoles.length > 0 ? '#2E7D32' : '#555', 
              color: 'white', 
              border: 'none', 
              padding: '4px 12px', 
              borderRadius: '4px', 
              cursor: demoRoles.length > 0 ? 'pointer' : 'not-allowed' 
            }}
          >
            Login
          </button>
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