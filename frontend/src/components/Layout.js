import AiChatbotWidget from './AiChatbotWidget';
import { Outlet, Link } from 'react-router-dom';
import '../global.css';

const Layout = () => {
  return (
    <div className="app-container">
      {/* 1. Global Navigation Bar */}
      <nav className="global-navbar">
        <div className="logo">SharePlate</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/donate">Donate</Link>
          <Link to="/request">Request</Link>
          <Link to="/map">Map</Link>
          <Link to="/volunteer">Volunteer</Link>
        </div>
        <div className="auth-links">
           <Link to="/login">Login / Register</Link>
        </div>
      </nav>

      {/* 2. Dynamic Content Area */}
      <main className="main-content">
        {/* The active page component is injected right here */}
        <Outlet /> 
      </main>

      {/* 3. Global Footer */}
      <footer className="global-footer">
        <p>&copy; 2026 LaunchLab Team 1. All rights reserved.</p>
      </footer>

      {/* 4. Future Home of your AI Chatbot */}
      <AiChatbotWidget />
    </div>
  );
};

export default Layout;