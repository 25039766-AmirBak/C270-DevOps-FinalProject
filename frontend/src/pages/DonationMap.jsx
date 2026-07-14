import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";

// Fix default marker icon paths
// Leaflet's default map pins often break when compiled in React. 
// This block forces the app to pull the correct images from a public server.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 📍 BULLETPROOF DICTIONARY: Bypasses API limits for known locations
// This acts as a "fast lane". If the database has one of these locations, 
// we instantly know the coordinates and don't need to ask the Nominatim API, preventing rate-limit bans.
const knownLocations = {
  "woodlands": { lat: 1.4368, lng: 103.7865 },
  "woodland": { lat: 1.4368, lng: 103.7865 }, 
  "admiralty": { lat: 1.4406, lng: 103.8008 },
  "republic polytechnic": { lat: 1.4428, lng: 103.7848 },
  "rp canteen": { lat: 1.4428, lng: 103.7848 },
  "ang mo kio": { lat: 1.3691, lng: 103.8454 },
  "orchard": { lat: 1.3048, lng: 103.8318 },
  "orchad": { lat: 1.3048, lng: 103.8318 } 
};

export default function DonationMap() {
  // --- REACT STATES ---
  // These hold the live data for our app. When these change, the page updates.
  const [donations, setDonations] = useState([]); // Holds all food items from the database
  const [searchQuery, setSearchQuery] = useState(""); // Holds what the user types in the search bar
  const [searchError, setSearchError] = useState(""); // Holds error messages if a search fails
  const [activeFilter, setActiveFilter] = useState("all"); // Tracks if the user clicked "All" or "Expired"
  
  // --- REACT REFS ---
  // Refs hold onto data or HTML elements without causing the page to refresh when they change.
  const mapContainerRef = useRef(null); // Connects to the HTML <div> where the map will be drawn
  const mapInstanceRef = useRef(null); // Holds the actual Leaflet map engine once it starts
  const isGeocodingRef = useRef(false); // A safety lock to prevent React from running the API loop twice at the same time

  // 1. Fetch real data
  // This runs once when the page loads. It grabs your backend data and saves it to the 'donations' state.
  useEffect(() => {
    fetch('http://localhost:5000/api/donations') 
      .then(res => res.json())
      .then(data => setDonations(data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  // 2. Initialize map & plot pins
  // This hook handles drawing the map and dropping the pins whenever the 'donations' data updates.
  useEffect(() => {
    // If the HTML container isn't ready yet, stop here.
    if (!mapContainerRef.current) return;

    // If the map hasn't been created yet, build it and center it on Singapore.
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([1.3521, 103.8198], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear old markers off the map so we don't accidentally double-draw them.
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) mapInstanceRef.current.removeLayer(layer);
    });

    // --- HELPER FUNCTION: Turns text into map pins ---
    const plotDynamicMarker = async (item) => {
      let lat = item.lat || item.latitude; // Check if database already has latitude
      let lng = item.lng || item.longitude || item.lon; // Check if database already has longitude
      let usedApi = false; // Tracks if we had to ask the Nominatim API for help

      // If we don't have coordinates yet, we need to find them.
      if (!lat || !lng) {
        const locString = (item.location || "").toLowerCase().trim();
        
        // Strategy A: Check our hardcoded dictionary first (Fast & Safe)
        if (knownLocations[locString]) {
          lat = knownLocations[locString].lat;
          lng = knownLocations[locString].lng;
        } else if (locString) {
          // Strategy B: If it's a completely new location, ask the Nominatim API
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locString + ", Singapore")}`);
            const data = await res.json();
            if (data && data.length > 0) {
              lat = parseFloat(data[0].lat);
              lng = parseFloat(data[0].lon);
              usedApi = true; // We used the API, so we will need to pause later
            }
          } catch (err) {
            console.warn("API blocked this request, skipping:", locString);
          }
        }
      }

      // If we successfully found coordinates, drop the pin!
      if (lat && lng) {
        // JITTER: Adds a tiny random math offset so items at the exact same location sit side-by-side instead of overlapping.
        const latOffset = (Math.random() - 0.5) * 0.003; 
        const lngOffset = (Math.random() - 0.5) * 0.003;

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
      return usedApi; // Return whether we used the API so the main loop knows to pause
    };

    // --- MAIN LOOP: The Traffic Light ---
    // Loads items one-by-one to prevent hitting the "429 Too Many Requests" API error.
    const loadMarkers = async () => {
      // If a loop is already running, or there's no data, stop here.
      if (isGeocodingRef.current || donations.length === 0) return;
      isGeocodingRef.current = true; // Lock the safety door
      
      for (let i = 0; i < donations.length; i++) {
        const usedApi = await plotDynamicMarker(donations[i]);
        if (usedApi) {
          // If we pinged the API, forcefully pause the code for 1.5 seconds to cool down.
          await new Promise(resolve => setTimeout(resolve, 1500)); 
        }
      }
      isGeocodingRef.current = false; // Unlock the safety door when finished
    };

    loadMarkers(); // Kick off the loop
  }, [donations]);

  // --- SEARCH HANDLER ---
  // Runs when the user types a location into the search bar and clicks "Find"
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    setSearchError("");

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Singapore")}`);
      const data = await res.json();
      if (data && data.length > 0) {
        // If found, move the map camera to the new coordinates at zoom level 14
        mapInstanceRef.current.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 14);
      } else {
        setSearchError("Location not found.");
      }
    } catch (err) {
      setSearchError("Search failed.");
    }
  };

  // --- CLICK-TO-PAN HELPER ---
  // If the user clicks an item in the sidebar, instantly move the map to that location.
  const focusOnLocation = (locName) => {
    const locString = (locName || "").toLowerCase().trim();
    if (knownLocations[locString] && mapInstanceRef.current) {
      mapInstanceRef.current.setView([knownLocations[locString].lat, knownLocations[locString].lng], 14);
    }
  };

  // 📊 DASHBOARD METRICS CALCULATIONS
  // Calculate unique locations by mapping out all text locations and tossing them into a 'Set' (which automatically removes duplicates).
  const uniqueLocations = new Set(donations.map(d => (d.location || "").toLowerCase().trim())).size;
  
  // 🔥 CHANGE 1: Calculate Expired Items (Anything where the expiry date has passed)
  const expiredItems = donations.filter(d => {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate) < new Date(); 
  });

  // Decide which list to show in the sidebar based on what button the user clicked
  const displayedDonations = activeFilter === "expired" ? expiredItems : donations;

  // --- HTML LAYOUT (JSX) ---
  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "32px 24px", 
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: "#F3F4F6", // Slightly darker background to make cards pop
      minHeight: "100vh"
    }}>
      
      {/* 🟢 TOP DASHBOARD HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: "#1F2937", margin: "0 0 6px 0", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
          Operations Dashboard
        </h1>
        <p style={{ color: "#6B7280", margin: 0, fontSize: "14px" }}>Live overview of community food rescue operations.</p>
      </div>
        
      {/* 📊 KPI METRICS ROW: Three top cards showing the data calculations we did above */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "20px", 
        marginBottom: "24px" 
      }}>
        {/* Metric Card 1 */}
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: "600", textTransform: "uppercase" }}>Total Food Items</div>
          <div style={{ fontSize: "32px", fontWeight: "800", color: "#2E7D32", marginTop: "8px" }}>{donations.length}</div>
        </div>
        
        {/* Metric Card 2 */}
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: "600", textTransform: "uppercase" }}>Active Distribution Hubs</div>
          <div style={{ fontSize: "32px", fontWeight: "800", color: "#2563EB", marginTop: "8px" }}>{uniqueLocations}</div>
        </div>

        {/* 🔥 CHANGE 2: Update UI Text to "Expired Items" */}
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", borderLeft: "4px solid #DC2626" }}>
          <div style={{ fontSize: "13px", color: "#DC2626", fontWeight: "700", textTransform: "uppercase" }}>Expired Items</div>
          <div style={{ fontSize: "32px", fontWeight: "800", color: "#991B1B", marginTop: "8px" }}>{expiredItems.length}</div>
        </div>
      </div>

      {/* 🟢 THE MAIN INTERACTIVE GRID: Splits the screen into a Sidebar (left) and Map (right) */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "350px 1fr", 
        gap: "24px",
        alignItems: "start"
      }}>
        
        {/* LEFT COLUMN: SIDEBAR LIST & SEARCH */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Search Box Card */}
          <div style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
            <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#4B5563" }}>LOCATE NEIGHBORHOOD</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="e.g. Woodlands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "14px", outline: "none" }}
                />
                <button type="submit" style={{ padding: "10px 16px", background: "#1F2937", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
                  Find
                </button>
              </div>
            </form>
            {searchError && <p style={{ color: "#DC2626", fontSize: "12px", margin: "8px 0 0 0" }}>{searchError}</p>}
          </div>

          {/* Directory Panel with Dashboard Filters */}
          <div style={{ 
            background: "white", 
            borderRadius: "12px", 
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            maxHeight: "440px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "14px", color: "#374151", fontWeight: "700" }}>INVENTORY</h3>
              
              {/* Dashboard Filter Toggle Buttons */}
              <div style={{ display: "flex", gap: "4px", background: "#F3F4F6", padding: "4px", borderRadius: "6px" }}>
                <button 
                  onClick={() => setActiveFilter("all")}
                  style={{ padding: "4px 8px", fontSize: "11px", fontWeight: "600", border: "none", borderRadius: "4px", cursor: "pointer", background: activeFilter === "all" ? "white" : "transparent", color: activeFilter === "all" ? "#1F2937" : "#6B7280", boxShadow: activeFilter === "all" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}
                >
                  All
                </button>
                {/* 🔥 CHANGE 3: Changed the button to "Expired" */}
                <button 
                  onClick={() => setActiveFilter("expired")}
                  style={{ padding: "4px 8px", fontSize: "11px", fontWeight: "600", border: "none", borderRadius: "4px", cursor: "pointer", background: activeFilter === "expired" ? "#FEF2F2" : "transparent", color: activeFilter === "expired" ? "#DC2626" : "#6B7280" }}
                >
                  Expired
                </button>
              </div>
            </div>
            
            {/* Scrollable List of Food Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", paddingRight: "4px" }}>
              {/* If the filter returns nothing, show this message */}
              {displayedDonations.length === 0 ? (
                <div style={{ fontSize: "13px", color: "#9CA3AF", textAlign: "center", padding: "20px 0" }}>No items match this filter.</div>
              ) : (
                /* Otherwise, map through the displayedDonations array and draw a card for each one */
                displayedDonations.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => focusOnLocation(item.location)}
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #F3F4F6", 
                      background: "#F9FAFB",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#1F2937", marginBottom: "4px" }}>
                      {item.foodName || "Food Item"}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6B7280" }}>
                      <span>Qty: {item.quantity || "N/A"}</span>
                      <span>📍 {item.location || "Singapore"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE MAP */}
        <div style={{ 
          background: "white",
          padding: "12px",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        }}>
          {/* This is the empty <div> that Leaflet attaches to via mapContainerRef */}
          <div 
            ref={mapContainerRef} 
            style={{ 
              height: "600px", 
              width: "100%", 
              borderRadius: "12px",
              border: "1px solid #E5E7EB"
            }} 
          />
        </div>

      </div>
    </div>
  );
}