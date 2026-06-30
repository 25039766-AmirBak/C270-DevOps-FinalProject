Interactive Map & Routing API Planning

This file outlines the technical research, requirements, and implementation steps for Member 5 (Cloud Deployment & Map/Routing Integration).

---

## 🗺️ 1. API Evaluation & Selection
We need to finalize which mapping library to use before Phase 4 development begins. 

*   **Option A: Leaflet.js + React-Leaflet (Recommended)**
    *   *Pros:* 100% free, open-source, lightweight, no credit card or billing configuration required.
    *   *Cons:* Standard map tiles are basic; requires external plugins for advanced routing features.
*   **Option B: Google Maps API**
    *   *Pros:* Industry standard, powerful routing engine, highly accurate Singapore address parsing.
    *   *Cons:* Requires setting up a Google Cloud billing profile with a credit card.


---

## 📍 2. Core Feature Requirements
Based on the project goals for our Food Donation platform, the interactive map component must handle:

### A. Geocoding (Address to Coordinates)
*   Donors will enter text addresses (e.g., `Blk 123 Toa Payoh`).
*   The system must convert this text into Latitude/Longitude coordinates so the map can plot it.
*   *Tool to research:* OpenStreetMap's free **Nominatim API** or Google Geocoding API.

### B. Interactive Donation Map
*   Render a map centered natively over Singapore (`1.3521° N, 103.8198° E`).
*   Fetch active food donation listings from Member 3's backend database.
*   Drop custom markers/pins representing available food packages.
*   Show clickable popups on each pin detailing the food item, expiry time, and collection details.

### C. Volunteer Routing Engine
*   Allow a volunteer to see the path from their current location to the food drop-off point.
*   *Tool to research:* Leaflet Routing Machine plugin or Google Directions API.

---

## 🛠️ 3. Implementation Roadmap (Phase 4 Timeline)

- [ ] **Step 1:** Build a standalone, isolated React map component centered on Singapore.
- [ ] **Step 2:** Test dummy data arrays to render multiple mock pins on the map.
- [ ] **Step 3:** Connect the map frontend to Member 3's live backend endpoints to fetch real coordination coordinates.
- [ ] **Step 4:** Securely pass the map API keys (if using Google) into the application using production environment variables (`.env`).
