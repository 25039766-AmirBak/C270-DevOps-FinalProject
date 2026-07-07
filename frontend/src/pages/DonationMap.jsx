import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet's default marker icon paths so they render correctly in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Helper component to smoothly pan the map viewport when searching neighborhoods
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function DonationMap() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([1.3521, 103.8198]); // Centers on Singapore
  const [searchError, setSearchError] = useState("");

  // Fetch donation entries from backend, with local mockup backup fallback
  useEffect(() => {
    const fetchDonationPins = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/donations");
        if (!response.ok) throw new Error("Backend server network error");
        const data = await response.json();
        
        // If backend is running but database collection is completely empty, use mock items
        if (!data || data.length === 0) {
          useMockFallback("No active entries in database. Showing demo markers!");
        } else {
          setDonations(data);
        }
      } catch (err) {
        useMockFallback(`Backend unreachable (${err.message}). Showing demo markers!`);
      } finally {
        setLoading(false);
      }
    };

    const useMockFallback = (logMessage) => {
      console.warn(logMessage);
      setDonations([
        {
          _id: "demo-1",
          title: "Surplus Bento Meals",
          quantity: 15,
          location: "Woodlands MRT Station, Singapore",
          expiryDate: "2026-07-15",
          coordinates: [1.4368, 103.7865] // Prefetched safe coordinates
        },
        {
          _id: "demo-2",
          title: "Fresh Whole Apples",
          quantity: 40,
          location: "Ang Mo Kio Hub, Singapore",
          expiryDate: "2026-07-20",
          coordinates: [1.3694, 103.8495] // Prefetched safe coordinates
        }
      ]);
    };

    fetchDonationPins();
  }, []);

  // Handle manual neighborhood address searches via OpenStreetMap Nominatim API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ", Singapore"
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
      } else {
        setSearchError("Location not found. Try another landmark or postal code!");
      }
    } catch (err) {
      setSearchError("Search service currently busy. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", fontSize: "1.2rem", color: "#6B7280" }}>
        Loading Distribution Map System...
      </div>
    );
  }

  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
      
      {/* Search Layout Panel */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search Singapore neighborhood, landmark or postal code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            fontSize: "1rem"
          }}
        />
        <button
          type="submit"
          className="btn btn-secondary"
          style={{ border: "none", cursor: "pointer" }}
        >
          Search Location
        </button>
      </form>

      {searchError && (
        <p style={{ color: "#EF4444", marginTop: "-12px", marginBottom: "15px", fontSize: "0.9rem" }}>
          ⚠️ {searchError}
        </p>
      )}

      {/* Interactive Map Canvas Container */}
      <div style={{ height: "550px", width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
        <MapContainer center={mapCenter} zoom={11} style={{ height: "100%", width: "100%" }}>
          <ChangeView center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Map Marker Pins Plotter */}
          {donations.map((item) => {
            // Check fallback fields or backend coordinates array field options
            const pinPosition = item.coordinates || 
              (item.lat && item.lng ? [item.lat, item.lng] : [1.4368, 103.7865]);

            return (
              <Marker key={item._id} position={pinPosition}>
                <Popup>
                  <div style={{ fontSize: "0.95rem", lineHeight: "1.4" }}>
                    <h3 style={{ margin: "0 0 6px 0", color: "#2E7D32" }}>{item.title}</h3>
                    <p style={{ margin: "0 0 4px 0" }}><strong>Quantity:</strong> {item.quantity}</p>
                    <p style={{ margin: "0 0 4px 0", color: "#4B5563" }}>📍 {item.location}</p>
                    <p style={{ margin: "0", fontSize: "0.85rem", color: "#9CA3AF" }}>
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
