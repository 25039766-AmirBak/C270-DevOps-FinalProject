import L from 'leaflet';

// --- Leaflet default marker icon fix ---
// Same fix used in DonationMap.jsx — Leaflet's default marker icons don't
// resolve correctly under most bundlers, so we point them at the CDN.
// Safe to call more than once (mergeOptions is idempotent).
export function fixLeafletIcons() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// 📍 Same "bulletproof dictionary" approach as DonationMap.jsx — bypasses
// geocoding API limits/flakiness for known Singapore neighbourhoods.
export const knownLocations = {
  woodlands: { lat: 1.4368, lng: 103.7865 },
  woodland: { lat: 1.4368, lng: 103.7865 },
  admiralty: { lat: 1.4406, lng: 103.8008 },
  'republic polytechnic': { lat: 1.4428, lng: 103.7848 },
  'rp canteen': { lat: 1.4428, lng: 103.7848 },
  'ang mo kio': { lat: 1.3691, lng: 103.8454 },
  orchard: { lat: 1.3048, lng: 103.8318 },
  orchad: { lat: 1.3048, lng: 103.8318 },
  jurong: { lat: 1.3329, lng: 103.7436 },
  'toa payoh': { lat: 1.3343, lng: 103.8563 },
  sengkang: { lat: 1.3868, lng: 103.8914 },
  bedok: { lat: 1.3236, lng: 103.9273 },
};

/**
 * Resolves a Singapore place name / area to lat/lng.
 * Checks the known-location dictionary first, then falls back to the
 * Nominatim (OpenStreetMap) geocoding API, exactly like DonationMap.jsx does.
 * Returns null if nothing could be resolved.
 */
export async function geocodeLocation(locationString) {
  const key = (locationString || '').toLowerCase().trim();
  if (!key) return null;

  if (knownLocations[key]) {
    return { ...knownLocations[key], usedApi: false };
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(key + ', Singapore')}`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), usedApi: true };
    }
  } catch (err) {
    console.warn('Geocoding API blocked this request, skipping:', key);
  }

  return null;
}

// --- Proxy recipient names ---
// FamilyLocation only stores a street address for privacy — there's no real
// recipient name attached to it. For the volunteer-facing map/list we
// generate a stable, clearly-fictional label per location so volunteers have
// something human to refer to ("the Tan family") without exposing any real
// personal data.
const PROXY_SURNAMES = [
  'Tan', 'Lim', 'Lee', 'Ng', 'Wong', 'Chua', 'Goh', 'Koh', 'Teo', 'Ong',
  'Chan', 'Yeo', 'Chia', 'Sim', 'Toh',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getProxyRecipientLabel(locationId) {
  const id = String(locationId || '');
  const surname = PROXY_SURNAMES[hashString(id) % PROXY_SURNAMES.length];
  return `The ${surname} Family`;
}
