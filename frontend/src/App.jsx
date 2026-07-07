import PostDonation from "./pages/PostDonation";
import DonationMap from "./pages/DonationMap";

function App() {
  return (
    <div className="app-container">
      
      {/* Dynamic Global Navigation Header Bar */}
      <header className="global-navbar">
        <div className="logo">SharePlate Platform</div>
        <nav className="nav-links">
          <a href="#donation-form">Post Food</a>
          <a href="#live-map">Live Map</a>
        </nav>
      </header>

      {/* Main Container Wrapper */}
      <main className="main-content">
        
        {/* Member 4's Feature: The Donation Form */}
        <section id="donation-form">
          <PostDonation />
        </section>

        <hr style={{ margin: '50px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

        {/* Your Feature: The Interactive Map Layout */}
        <section id="live-map" style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Live Distribution Map</h2>
          <p style={{ color: '#4B5563', marginBottom: '25px', fontSize: '1.05rem' }}>
            Locate surplus food available for pickup across Singapore in real-time.
          </p>
          <DonationMap />
        </section>
        
      </main>

      {/* Comprehensive Brand Footer */}
      <footer className="global-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3>SharePlate</h3>
            <p>Reducing food waste and bridging surplus resources directly to communities across Singapore.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#donation-form">Share Food</a>
            <a href="#live-map">Find Distribution Centers</a>
          </div>
          <div className="footer-socials">
            <h4>Connect</h4>
            <a href="#">About Project</a>
            <a href="#">DevOps Workspace</a>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} SharePlate Platform. All Rights Reserved.
        </div>
      </footer>
      
    </div>
  );
}

export default App;
