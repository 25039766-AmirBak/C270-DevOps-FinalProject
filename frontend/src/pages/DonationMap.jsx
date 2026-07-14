import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
// Use CDN for CSS to avoid local path resolution issues
import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

// Fix for default Leaflet marker icons using CDN URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ChangeMapView = ({ center }) => {
  const map = useMap();
  map.setView(center, 14);
  return null;
};

const DonationMap = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressQuery, setAddressQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([1.3521, 103.8198]); 
  const [geocodingError, setGeocodingError] = useState('');

  useEffect(() => {
    const loadDonationCoordinates = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/donations');
        const data = await response.json();
        const activePostings = data.filter(item => item.status === 'Available');
        setDonations(activePostings);
        setLoading(false);
      } catch (error) {
        console.error('Failed to retrieve spatial coordinate dataset:', error);
        setLoading(false);
      }
    };
    loadDonationCoordinates();
  }, []);

  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!addressQuery.trim()) return;

    setGeocodingError('');
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery + ', Singapore')}&limit=1`;
      const response = await fetch(searchUrl, { headers: { 'User-Agent': 'SharePlate-App' } });
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      } else {
        setGeocodingError('Address not found.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodingError('Error connecting to geocoding server.');
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading live map...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleAddressSearch} style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Enter address..."
          value={addressQuery}
          onChange={(e) => setAddressQuery(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#2c3e50', color: 'white' }}>
          Search
        </button>
      </form>
      
      {geocodingError && <p style={{ color: 'red', marginTop: '-10px', marginBottom: '15px' }}>{geocodingError}</p>}

      <div style={{ height: '550px', width: '100%', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ChangeMapView center={mapCenter} />
          {donations.map((donation) => {
            const lng = donation.location.geo.coordinates[0];
            const lat = donation.location.geo.coordinates[1];
            return (
              <Marker key={donation._id} position={[lat, lng]}>
                <Popup>
                  <div style={{ minWidth: '150px' }}>
                    <h4 style={{ margin: '0 0 6px 0' }}>{donation.foodName}</h4>
                    <p style={{ margin: '0' }}>Qty: {donation.quantity}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default DonationMap;