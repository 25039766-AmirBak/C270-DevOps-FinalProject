import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import React, { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";

// Fix default marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 📍 BULLETPROOF DICTIONARY: Bypasses API limits for known locations
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

const learnedLocationsStorageKey = "donationMap.learnedLocations.v1";
const geocodeDelayMs = 1200;

const donationApiCandidates = [
  `${process.env.REACT_APP_API_URL || ""}/api/donations`.replace(/([^:]\/)\/+/g, "$1"),
  "http://localhost:5000/api/donations",
  "/api/donations"
];

const toNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeLocation = (value) => String(value || "").toLowerCase().trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function DonationMap() {
  const [donations, setDonations] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchError, setSearchError] = useState(""); 
  const [activeFilter, setActiveFilter] = useState("all"); 
  const [learnedLocations, setLearnedLocations] = useState({});
  
  const mapContainerRef = useRef(null); 
  const mapInstanceRef = useRef(null); 
  const isGeocodingRef = useRef(false); 
  const geocodeInFlightRef = useRef(new Map());
  const lastGeocodeAtRef = useRef(0);

  useEffect(() => {
    const serialized = window.localStorage.getItem(learnedLocationsStorageKey);
    if (!serialized) return;

    try {
      const parsed = JSON.parse(serialized);
      if (parsed && typeof parsed === "object") {
        setLearnedLocations(parsed);
      }
    } catch (error) {
      console.warn("Invalid learned locations cache. Resetting cache.", error);
      window.localStorage.removeItem(learnedLocationsStorageKey);
    }
  }, []);

  // 1. Fetch real data
  useEffect(() => {
    let cancelled = false;

    const fetchDonations = async () => {
      for (const url of donationApiCandidates) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (!cancelled) {
            setDonations(Array.isArray(data) ? data : []);
          }
          return;
        } catch (err) {
          console.warn(`Failed to fetch donations from ${url}:`, err);
        }
      }
      if (!cancelled) {
        setDonations([]);
      }
      console.error("Unable to load donations from any API endpoint.");
    };

    fetchDonations();

    const intervalId = setInterval(fetchDonations, 15000);
    const handleWindowFocus = () => fetchDonations();

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const persistLearnedLocation = useCallback((locationName, lat, lng) => {
    const normalized = normalizeLocation(locationName);
    if (!normalized) return;

    const safeLat = toNumberOrNull(lat);
    const safeLng = toNumberOrNull(lng);
    if (safeLat === null || safeLng === null) return;

    setLearnedLocations((previous) => {
      const existing = previous[normalized];
      if (existing && existing.lat === safeLat && existing.lng === safeLng) {
        return previous;
      }

      const updated = {
        ...previous,
        [normalized]: { lat: safeLat, lng: safeLng }
      };

      window.localStorage.setItem(learnedLocationsStorageKey, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resolveCoordinatesFromLocation = useCallback(async (locationName) => {
    const normalizedLocation = normalizeLocation(locationName);
    if (!normalizedLocation) return null;

    const cached = learnedLocations[normalizedLocation] || knownLocations[normalizedLocation];
    if (cached) {
      return { lat: cached.lat, lng: cached.lng, usedApi: false };
    }

    const inFlightRequest = geocodeInFlightRef.current.get(normalizedLocation);
    if (inFlightRequest) {
      return inFlightRequest;
    }

    const requestPromise = (async () => {
      const now = Date.now();
      const waitTime = geocodeDelayMs - (now - lastGeocodeAtRef.current);
      if (waitTime > 0) {
        await sleep(waitTime);
      }

      lastGeocodeAtRef.current = Date.now();
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(normalizedLocation + ", Singapore")}`
      );
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      const lat = toNumberOrNull(data[0].lat);
      const lng = toNumberOrNull(data[0].lon);
      if (lat === null || lng === null) {
        return null;
      }

      persistLearnedLocation(normalizedLocation, lat, lng);
      return { lat, lng, usedApi: true };
    })();

    geocodeInFlightRef.current.set(normalizedLocation, requestPromise);

    try {
      return await requestPromise;
    } catch (error) {
      console.warn("Geocoding failed for location:", normalizedLocation, error);
      return null;
    } finally {
      geocodeInFlightRef.current.delete(normalizedLocation);
    }
  }, [learnedLocations, persistLearnedLocation]);

  // 🔥 CHANGE 1: We moved the filter math up here so the Map can use it!
  const uniqueLocations = new Set(donations.map(d => (d.location || "").toLowerCase().trim())).size;
  
  const expiredItems = donations.filter(d => {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate) < new Date(); 
  });

  const activeItems = donations.filter(d => {
    if (!d.expiryDate) return true; // Keep items with no date
    return new Date(d.expiryDate) >= new Date(); // Keep safe items
  });

  // Figure out which list to show based on the active button
  let displayedDonations = donations;
  if (activeFilter === "expired") displayedDonations = expiredItems;
  if (activeFilter === "active") displayedDonations = activeItems;


  // 2. Initialize map & plot pins
  // 🔥 CHANGE 2: This hook now relies on [displayedDonations] instead of [donations]
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([1.3521, 103.8198], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) mapInstanceRef.current.removeLayer(layer);
    });

    const plotDynamicMarker = async (item) => {
      let lat = toNumberOrNull(item.lat ?? item.latitude); 
      let lng = toNumberOrNull(item.lng ?? item.longitude ?? item.lon); 
      let usedApi = false; 

      if (lat === null || lng === null) {
        const resolved = await resolveCoordinatesFromLocation(item.location);
        if (resolved) {
          lat = resolved.lat;
          lng = resolved.lng;
          usedApi = resolved.usedApi;
        }
      }

      if (lat !== null && lng !== null) {
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

    const loadMarkers = async () => {
      // 🔥 CHANGE 3: The map now loops through displayedDonations!
      if (isGeocodingRef.current || displayedDonations.length === 0) return;
      isGeocodingRef.current = true; 

      try {
        for (let i = 0; i < displayedDonations.length; i++) {
          const usedApi = await plotDynamicMarker(displayedDonations[i]);
          if (usedApi) continue;
        }
      } finally {
        isGeocodingRef.current = false; 
      }
    };

    loadMarkers(); 
  }, [displayedDonations, resolveCoordinatesFromLocation]); 


  // --- SEARCH HANDLER ---
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

  // --- CLICK-TO-PAN HELPER ---
  const focusOnLocation = (locName) => {
    const locString = normalizeLocation(locName);
    const coordinates = learnedLocations[locString] || knownLocations[locString];
    if (coordinates && mapInstanceRef.current) {
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 14);
    }
  };


  // --- HTML LAYOUT (JSX) ---
  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "32px 24px", 
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: "#F3F4F6", 
      minHeight: "100vh"
    }}>
      
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: "#1F2937", margin: "0 0 6px 0", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
          Operations Dashboard
        </h1>
        <p style={{ color: "#6B7280", margin: 0, fontSize: "14px" }}>Live overview of community food rescue operations.</p>
      </div>
        
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

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "350px 1fr", 
        gap: "24px",
        alignItems: "start"
      }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
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
              
              <div style={{ display: "flex", gap: "4px", background: "#F3F4F6", padding: "4px", borderRadius: "6px" }}>
                <button 
                  onClick={() => setActiveFilter("all")}
                  style={{ padding: "4px 8px", fontSize: "11px", fontWeight: "600", border: "none", borderRadius: "4px", cursor: "pointer", background: activeFilter === "all" ? "white" : "transparent", color: activeFilter === "all" ? "#1F2937" : "#6B7280", boxShadow: activeFilter === "all" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}
                >
                  All
                </button>
                {/* 🔥 CHANGE 4: The new "Active" button is now in the UI */}
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
              border: "1px solid #E5E7EB",
              zIndex: 0
            }} 
          />
        </div>

      </div>
    </div>
  );
}
