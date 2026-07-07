import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";

// Fix default marker icon paths for React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function DonationMap() {
  const [donations] = useState([
    {
      _id: "mock-woodlands",
      title: "Surplus Bento Meals",
      quantity: 15,
      location: "Woodlands MRT Station, Singapore",
      lat: 1.4368,
      lng: 103.7865
    },
    {
      _id: "mock-amk",
      title: "Fresh Whole Apples",
      quantity: 40,
      location: "Ang Mo Kio Hub, Singapore",
      lat: 1.3694,
      lng: 103.8495
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Initialize and clean up the map directly
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 📍 Prevent double initialization by checking if instance already exists
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([1.3521, 103.8198], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Plot the initial pins
      donations.forEach((item) => {
        L.marker([item.lat, item.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div>
              <h4 style="margin: 0 0 5px 0; color: #2E7D32;">${item.title}</h4>
              <p style="margin: 0 0 5px 0;">Quantity: ${item.quantity}</p>
              <p style="margin: 0; color: #666;">📍 ${item.location}</p>
            </div>
          `);
      });
    }

    // 📍 BULLETPROOF CLEANUP: Wipes out map completely when React unmounts/remounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [donations]);

  // Handle Search Repositioning
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    setSearchError("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ", Singapore"
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        mapInstanceRef.current.setView([lat, lon], 14);
      } else {
        setSearchError("Location not found. Try another location!");
      }
    } catch (err) {
      setSearchError("Search failed. Try again.");
    }
  };

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

      {/* Direct DOM Map Container hook */}
      <div 
        ref={mapContainerRef} 
        style={{ height: "500px", width: "100%", borderRadius: "8px", border: "1px solid #E5E7EB" }} 
      />
    </div>
  );
}
