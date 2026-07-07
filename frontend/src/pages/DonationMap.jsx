import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon paths for React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// View wrapper to handle map repositioning smoothly
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center]);
  return null;
}

export default function DonationMap() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([1.3521, 103.8198]); // Singapore Center
  const [searchError, setSearchError] = useState("");
  
  // 📍 THE SEED: State to prevent StrictMode double-rendering crash
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Force map component to only load AFTER the initial React cycle settles
    setIsMounted(true);

    // Load local mockup pins
    setDonations([
      {
        _id: "mock-woodlands",
        title: "Surplus Bento Meals",
        quantity: 15,
        location: "Woodlands MRT Station, Singapore",
        expiryDate: "2026-07-15",
        lat: 1.4368,
        lng: 103.7865
      },
      {
        _id: "mock-amk",
        title: "Fresh Whole Apples",
        quantity: 40,
        location: "Ang Mo Kio Hub, Singapore",
        expiryDate: "2026-07-20",
        lat: 1.3694,
        lng: 103.8495
      }
    ]);
    setLoading(false);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchError("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ", Singapore"
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        setSearchError("Location not found. Try another location!");
      }
    } catch (err) {
      setSearchError("Search failed. Try again.");
    }
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading Map Component...</div>;
  }

  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search neighborhood or postal code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "10px 20px", background: "#2E7D32", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Search
        </button>
      </form>

      {searchError && <p style={{ color: "red", fontSize: "0.9rem" }}>{searchError}</p>}

      <div style={{ height: "500px", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
        {/* 📍 SAFETY GUARD: Only render the Leaflet DOM structure if isMounted is true */}
        {isMounted && (
          <MapContainer center={mapCenter} zoom={11} style={{ height: "100%", width: "100%" }}>
            <ChangeView center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {donations.map((item) => (
              <Marker key={item._id} position={[item.lat, item.lng]}>
                <Popup>
                  <div>
                    <h4 style={{ margin: "0 0 5px 0" }}>{item.title}</h4>
                    <p style={{ margin: "0 0 5px 0" }}>Quantity: {item.quantity}</p>
                    <p style={{ margin: "0", color: "#666" }}>📍 {item.location}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
