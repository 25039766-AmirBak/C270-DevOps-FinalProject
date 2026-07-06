import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Vite asset compilation path issues for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to handle smooth panning when an address is searched manually
const ChangeMapView = ({ center }) => {
  const map = useMap();
  map.setView(center, 14);
  return null;
};

const DonationMap = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressQuery, setAddressQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([1.3521, 103.8198]); // Singapore Default Center
  const [geocodingError, setGeocodingError] = useState('');

  useEffect(() => {
    const loadDonationsAndGeocode = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/donations');
        const data = await response.json();
        
        // Filter for active postings
        const activePostings = data.filter(item => item.status === 'Available');

        // Geocode every text address on-the-fly
        const geocodedPostings = [];
        
        for (const donation of activePostings) {
          try {
            // Encode the string address safely
            const queryUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(donation.location + ', Singapore')}&limit=1`;
            
            const geoResponse = await fetch(queryUrl, {
              headers: { 'User-Agent': 'SharePlate-Food-Donation-App' }
            });
            const geoResult = await geoResponse.json();

            // If coordinates are successfully found, attach them to our localized data object
            if (geoResult && geoResult.length > 0) {
              geocodedPostings.push({
                ...donation,
                coordinates: [parseFloat(geoResult[0].lat), parseFloat(geoResult[0].lon)]
              });
            } else {
              console.warn(`Could not geocode address: ${donation.location}`);
            }
          } catch (err) {
            console.error(`Error geocoding item ${donation._id}:`, err);
          }
          
          // Small delay to respect Nominatim's fair-use rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        setDonations(geocodedPostings);
        setLoading(false);
      } catch (error) {
        console.error('Failed to retrieve or process donation listings:', error);
        setLoading(false);
      }
    };

    loadDonationsAndGeocode();
  }, []);

  // Manual search bar handler
  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!addressQuery.trim()) return;

    setGeocodingError('');
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery + ', Singapore')}&limit=1`;
      
      const response = await fetch(searchUrl, {
        headers: { 'User-Agent': 'SharePlate-Food-Donation-App' } 
      });
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      } else {
        setGeocodingError('Address not found. Try entering a postal code or building name.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodingError('Error connecting to geocoding server.');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Converting locations and loading live map...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <form onSubmit={handleAddressSearch} style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Enter donor address (e.g., Woodlands, Republic Polytechnic)..."
          value={addressQuery}
          onChange={(e) => setAddressQuery(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#2c3e50', color: 'white', border: 'none' }}>
          Search Location
        </button>
      </form>

      {geocodingError && <p style={{ color: 'red', marginTop: '-10px', marginBottom: '15px' }}>{geocodingError}</p>}

      <div style={{ height: '550px', width: '100%', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <MapContainer 
          center={mapCenter} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <ChangeMapView center={mapCenter} />

          {donations.map((donation) => (
            <Marker 
              key={donation._id} 
              position={donation.coordinates} // Uses our freshly compiled coordinates array [Lat, Lon]
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>{donation.foodName}</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><strong>Quantity:</strong> {donation.quantity}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>📍 {donation.location}</p>
                  <small style={{ color: '#666' }}>Expires: {new Date(donation.expiryDate).toLocaleDateString()}</small>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default DonationMap;