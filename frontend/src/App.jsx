import PostDonation from "./pages/PostDonation";
import DonationMap from "./pages/DonationMap";

function App() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontFamily: 'sans-serif', color: '#2c3e50' }}>
        SharePlate Platform
      </h1>
      
      {/* Member 4's Feature: The Donation Form */}
      <PostDonation />

      <hr style={{ margin: '40px 0', border: '1px solid #eee' }} />

      {/* Your Feature: The Interactive Map */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'sans-serif', color: '#2c3e50' }}>Live Distribution Map</h2>
        <p style={{ fontFamily: 'sans-serif', color: '#7f8c8d' }}>
          Locate surplus food available for pickup across Singapore.
        </p>
      </div>
      <DonationMap />
      
    </div>
  );
}

export default App;
