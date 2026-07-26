const API_BASE = "http://localhost:5000/api";

export async function getFamilyLocations() {
  const res = await fetch(`${API_BASE}/locations`);
  if (!res.ok) throw new Error("Failed to load family locations");
  return res.json();
}

export async function getBookingsForDate(dateKey) {
  const res = await fetch(`${API_BASE}/bookings?date=${dateKey}`);
  if (!res.ok) throw new Error("Failed to load bookings");
  return res.json();
}

export async function createBooking(payload) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create booking");
  }
  return data.booking;
}

export async function getBookingsByEmail(email) {
  const res = await fetch(`${API_BASE}/bookings?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to load your bookings");
  return res.json();
}

export async function cancelBooking(id) {
  const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
    method: "PATCH",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to cancel booking");
  }
  return data.booking;
}

export async function getBooking(id) {
  const res = await fetch(`${API_BASE}/bookings/${id}`);
  if (!res.ok) throw new Error("Failed to load booking");
  return res.json();
}
