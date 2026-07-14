import 'leaflet/dist/leaflet.css';
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
  const [donations, setDonations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // 1. Fetch real data from the backend
  useEffect(() => {
    fetch('http://localhost:5000/api/donations') 
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setDonations(data))
      .catch((error) => console.error("Error fetching donation data:", error));
  }, []);

  // 2. Initialize map and handle dynamic geocoding
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([1.3521, 103.8198], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers before drawing new ones to prevent duplication
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Helper function to geocode a single text location dynamically
    const plotDynamicMarker = async (item) => {
      let lat = item.lat || item.latitude;
      let lng = item.lng || item.longitude || item.lon;

      if (!lat || !lng) {
        if (!item.location) return;
        
        try {
          // Ask Nominatim to find the text location in Singapore
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              item.location + ", Singapore"
            )}`
          );
          const data = await response.json();
          
          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat);
            lng = parseFloat(data[0].lon);
          }
        } catch (err) {
          console.error(`Geocoding failed for: ${item.location}`, err);
          return;
        }
      }

      // If we have coordinates, drop the pin with a tiny random offset (Jitter)
      if (lat && lng) {
        const latOffset = (Math.random() - 0.5) * 0.0005; 
        const lngOffset = (Math.random() - 0.5) * 0.0005;

        L.marker([lat + latOffset, lng + lngOffset])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div>
              <h4 style="margin: 0 0 5px 0; color: #2E7D32;">${item.foodName || item.title || 'Donation'}</h4>
              <p style="margin: 0 0 5px 0;">Quantity: ${item.quantity || 'N/A'}</p>
              <p style="margin: 0 0 5px 0; color: #D32F2F; font-weight: bold;">
                📅 Expires: ${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
              <p style="margin: 0; color: #666;">📍 ${item.location || 'Singapore'}</p>
            </div>
          `);
      }
    };

    // 3. Traffic Light Method: Run sequentially to prevent 429 Too Many Requests
    const loadMarkersSlowly = async () => {
      for (let i = 0; i < donations.length; i++) {
        const item = donations[i];
        
        let lat = item.lat || item.latitude;
        let lng = item.lng || item.longitude || item.lon;
        
        await plotDynamicMarker(item);

        // Pause for 1.2 seconds if we had to ping the API
        if (!lat || !lng) {
          await new Promise(resolve => setTimeout(resolve, 1200)); 
        }
      }
    };

    // Kick off the throttled loading process
    loadMarkersSlowly();

    return () => {
      // Map cleanup on unmount
    };
  }, [donations]);

  // 4. Handle Search Repositioning
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    setSearchError("");

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Singapore")}`);
      const data = await res.json();
      if (data && data.length > 0) {
        mapInstanceRef.current.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 14);
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
      <div ref={mapContainerRef} style={{ height: "500px", width: "100%", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
    </div>
  );
}