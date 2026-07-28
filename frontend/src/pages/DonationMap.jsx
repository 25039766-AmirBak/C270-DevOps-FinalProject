<<<<<<< HEAD
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
=======
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";

// --- 🔧 LEAFLET BUG FIX ---
// 🗣️ SLIDE SPEECH: "One of the first frontend hurdles I encountered was a known bug where modern bundlers like Vite break Leaflet's local asset paths, causing map pins to render as broken images. Instead of using heavy plugins, I wrote a direct override using L.Icon.Default.mergeOptions to pull high-resolution Retina pins directly from the public Unpkg CDN."
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- 📍 LOCAL CACHE DICTIONARY ---
// 🗣️ SLIDE SPEECH: "To bypass the strict 1-second rate limits of the public OpenStreetMap API, I engineered a hybrid caching mechanism. By creating this local dictionary of our most frequent distribution hubs like Woodlands and AMK, the application looks up coordinates instantly offline, protecting our server from getting blacklisted."
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

// ==============================================================================
// 🗣️ SLIDE SPEECH (INTRODUCTORY SLIDE): FEATURE OVERVIEW & LEAFLET VS GOOGLE MAPS
// "For my primary contribution to the Food Rescue Hub, I wanted to solve a fundamental user experience problem: 
// looking at rows of data in a database isn't helpful when you are trying to physically locate food in your neighborhood. 
// To solve this, I architected and built the Interactive Rescue Map. The goal was to create a centralized command center. 
// As you can see, it’s built on a split-screen architecture. On the left, we have a live React dashboard that tracks our total inventory and handles real-time safety filtering. 
// On the right, we have a dynamic map that translates those database items into physical, clickable locations.
// 
// One quick architectural note: you might wonder why we used Leaflet instead of Google Maps. 
// Leaflet is completely open-source, which means we have total control over the UI and no surprise API billing for a community project. 
// It also gave us a fast, lightweight blank canvas without the bloat of proprietary tools."
// ==============================================================================

export default function DonationMap() {
  // --- 📊 REACT STATES ---
  // 🗣️ SLIDE SPEECH: "I utilized four distinct React state hooks to manage the interactive data memory of the dashboard: tracking raw backend data, user search input, dynamic query error messaging, and the state of our filtering toggle system."
  const [donations, setDonations] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchError, setSearchError] = useState(""); 
  const [activeFilter, setActiveFilter] = useState("all"); 
  
  // --- 🏢 REACT REFS ---
  // 🗣️ SLIDE SPEECH: "To prevent map stuttering during component re-renders, I used React Refs. The mapContainerRef anchors directly to our HTML canvas, while the isGeocodingRef acts as a physical safety lock that stops React Strict Mode from firing duplicate API requests simultaneously."
  const mapContainerRef = useRef(null); 
  const mapInstanceRef = useRef(null); 
  const isGeocodingRef = useRef(false); 

  // --- 1. DATA FETCHING ---
  // 🗣️ SLIDE SPEECH: "On component mount, this useEffect asynchronously pulls raw donation records from our Express REST API backend and safely populates our local React state memory."
  useEffect(() => {
    fetch('http://localhost:5000/api/donations') 
      .then(res => res.json())
      .then(data => setDonations(data)) 
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  // --- 🧠 DASHBOARD MATH & FILTERING ---
  // 🗣️ SLIDE SPEECH: "I structured our data sorting logic at the very top of the script component. This allows the numbers to calculate dynamically on every state change, instantly updating both our upper KPI analytics cards and our visual map display."
  
  // 1. Calculate Active Hubs (Using a Javascript 'Set' to filter out duplicate addresses automatically)
  const uniqueLocations = new Set(donations.map(d => (d.location || "").toLowerCase().trim())).size;
  
  // 2. Find Expired Items (Filters items where the expiry timestamp is less than right now)
  const expiredItems = donations.filter(d => {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate) < new Date(); 
  });

  // 3. Find Active Items (Filters out expired items, keeping only items safe for public distribution)
  const activeItems = donations.filter(d => {
    if (!d.expiryDate) return true; 
    return new Date(d.expiryDate) >= new Date(); 
  });

  // 4. The Switchboard (Dynamically decides which dataset is pushed to the UI layout)
  let displayedDonations = donations;
  if (activeFilter === "expired") displayedDonations = expiredItems;
  if (activeFilter === "active") displayedDonations = activeItems;


  // --- 🗺️ MAP INITIALIZATION & PIN DRAWING ---
  // 🗣️ SLIDE SPEECH: "This core useEffect is completely responsive. Whenever a user changes the dashboard filter, this hook completely wipes the existing Leaflet map markers and redraws the new dataset from scratch, keeping our map perfectly synchronized with our sidebar."
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Step A: Mount Leaflet map instance centered on Singapore coordinates
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([1.3521, 103.8198], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Step B: Wipe map markers to prevent layout duplication
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) mapInstanceRef.current.removeLayer(layer);
    });

    // Step C: The Geocoding Fallback Engine
    // 🗣️ SLIDE SPEECH: "Inside the drawing loop, the system checks our local cache dictionary first. If a location is entirely new, it uses a fallback fetch query to call Nominatim, translating the text address into raw GPS latitude and longitude."
    const plotDynamicMarker = async (item) => {
      let lat = item.lat || item.latitude; 
      let lng = item.lng || item.longitude || item.lon; 
      let usedApi = false; 

      if (!lat || !lng) {
        const locString = (item.location || "").toLowerCase().trim();
        
        if (knownLocations[locString]) {
          lat = knownLocations[locString].lat;
          lng = knownLocations[locString].lng;
        } else if (locString) {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locString + ", Singapore")}`);
            const data = await res.json();
            if (data && data.length > 0) {
              lat = parseFloat(data[0].lat);
              lng = parseFloat(data[0].lon);
              usedApi = true; 
            }
          } catch (err) {
            console.warn("API blocked this request, skipping:", locString);
          }
        }
      }

      // Step D: The Jitter Algorithm & Custom HTML HTML Popups
      // 🗣️ SLIDE SPEECH: "To ensure an excellent user experience, I built a random scatter offset, or 'jitter'. If multiple donations occur at the exact same location, the pins sit side-by-side instead of stacking invisibly. Clicking a pin launches a customized HTML popup showing vital data with color-coded safety parameters."
      if (lat && lng) {
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
      return usedApi; 
    };

    // Step E: Asynchronous Throttling Loop (The Traffic Light)
    // 🗣️ SLIDE SPEECH: "To guarantee our application remains sub-banned by public servers, I built a custom asynchronous loop utilizing setTimeout. Whenever the system relies on an external API geocode call, it forces a 1.5-second buffer pause, maintaining full system stability."
    const loadMarkers = async () => {
      if (isGeocodingRef.current || displayedDonations.length === 0) return;
      isGeocodingRef.current = true; 
      
      for (let i = 0; i < displayedDonations.length; i++) {
        const usedApi = await plotDynamicMarker(displayedDonations[i]);
        if (usedApi) {
          await new Promise(resolve => setTimeout(resolve, 1500)); 
        }
      }
      isGeocodingRef.current = false; 
    };

    loadMarkers(); 
  }, [displayedDonations]); 


  // --- 🔍 NEIGHBORHOOD REGION SEARCH ---
  // 🗣️ SLIDE SPEECH: "I also implemented a manual search container. When users query a postal code or neighborhood, the handler fetches the coordinates and invokes Leaflet's .setView method, smoothly flying the map camera directly to that district."
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
        setSearchError("Location not found.");
      }
    } catch (err) {
      setSearchError("Search failed.");
    }
  };

  // --- 🖱️ INTERACTIVE DIRECTORY PANNING ---
  // 🗣️ SLIDE SPEECH: "To fully link our UI components, I engineered the focusOnLocation helper. When an item card in our sidebar listing is tapped, the map camera automatically pans and recalculates focus directly on top of that specific hub."
  const focusOnLocation = (locName) => {
    const locString = (locName || "").toLowerCase().trim();
    if (knownLocations[locString] && mapInstanceRef.current) {
      mapInstanceRef.current.setView([knownLocations[locString].lat, knownLocations[locString].lng], 14);
    }
  };


  // --- 🎨 LAYOUT RENDERING ---
  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "32px 24px", 
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: "#F3F4F6", 
      minHeight: "100vh"
    }}>
      
      {/* HEADER CONTROLS */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: "#1F2937", margin: "0 0 6px 0", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
          Operations Dashboard
        </h1>
        <p style={{ color: "#6B7280", margin: 0, fontSize: "14px" }}>Live overview of community food rescue operations.</p>
      </div>
        
      {/* 📊 KPI METRICS GRID BANNER */}
      {/* 🗣️ SLIDE SPEECH: "At the top of the interface, I deployed three distinct data telemetry cards that provide an operational summary of the system: total item entries, unique active hub distributions, and absolute expired volume counts." */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "20px", 
        marginBottom: "24px" 
      }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: "600", textTransform: "uppercase" }}>Total Food Items</div>
          <div style={{ fontSize: "32px", fontWeight: "800", color: "#2E7D32", marginTop: "8px" }}>{donations.length}</div>
        </div>
        
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: "600", textTransform: "uppercase" }}>Active Distribution Hubs</div>
          <div style={{ fontSize: "32px", fontWeight: "800", color: "#2563EB", marginTop: "8px" }}>{uniqueLocations}</div>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", borderLeft: "4px solid #DC2626" }}>
          <div style={{ fontSize: "13px", color: "#DC2626", fontWeight: "700", textTransform: "uppercase" }}>Expired Items</div>
          <div style={{ fontSize: "32px", fontWeight: "800", color: "#991B1B", marginTop: "8px" }}>{expiredItems.length}</div>
        </div>
      </div>

      {/* 🖥️ DUAL COLUMNS LAYOUT CONTAINER */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "350px 1fr", 
        gap: "24px",
        alignItems: "start"
      }}>
        
        {/* INTERACTIVE INVENTORY CARD SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Search Card Container */}
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

          {/* Directory Wrapper */}
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
              
              {/* Dynamic Toggle Segment Controls */}
              {/* 🗣️ SLIDE SPEECH: "The user controls are built directly into this switch group. Toggling these buttons triggers a conditional layout pass that updates the scroll list and fires the map re-render workflow seamlessly." */}
              <div style={{ display: "flex", gap: "4px", background: "#F3F4F6", padding: "4px", borderRadius: "6px" }}>
                <button 
                  onClick={() => setActiveFilter("all")}
                  style={{ padding: "4px 8px", fontSize: "11px", fontWeight: "600", border: "none", borderRadius: "4px", cursor: "pointer", background: activeFilter === "all" ? "white" : "transparent", color: activeFilter === "all" ? "#1F2937" : "#6B7280", boxShadow: activeFilter === "all" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveFilter("active")}
                  style={{ padding: "4px 8px", fontSize: "11px", fontWeight: "600", border: "none", borderRadius: "4px", cursor: "pointer", background: activeFilter === "active" ? "#ECFDF5" : "transparent", color: activeFilter === "active" ? "#059669" : "#6B7280", boxShadow: activeFilter === "active" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}
                >
                  Active
                </button>
                <button 
                  onClick={() => setActiveFilter("expired")}
                  style={{ padding: "4px 8px", fontSize: "11px", fontWeight: "600", border: "none", borderRadius: "4px", cursor: "pointer", background: activeFilter === "expired" ? "#FEF2F2" : "transparent", color: activeFilter === "expired" ? "#DC2626" : "#6B7280", boxShadow: activeFilter === "expired" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}
                >
                  Expired
                </button>
              </div>
            </div>
            
            {/* Scroll Container Rendering Node Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", paddingRight: "4px" }}>
              {displayedDonations.length === 0 ? (
                <div style={{ fontSize: "13px", color: "#9CA3AF", textAlign: "center", padding: "20px 0" }}>No items match this filter.</div>
              ) : (
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

        {/* --- GEOSPATIAL MAP CANVAS CONTAINER --- */}
        <div style={{ 
          background: "white",
          padding: "12px",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        }}>
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
>>>>>>> f2a63aefcdd081b6449fb4d00c579edef04f5ac5
