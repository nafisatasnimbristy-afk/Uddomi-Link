import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

function parseBookingEndDateTime(dateStr, timeSlot) {
  // dateStr: "YYYY-MM-DD"
  // timeSlot: "14:00 - 15:00"
  if (!dateStr || !timeSlot) return null;

  const parts = timeSlot.split("-");
  if (parts.length < 2) return null;

  const endPart = parts[1].trim(); // "15:00"
  const [hh, mm] = endPart.split(":").map((x) => Number(x));

  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  const dt = new Date(dateStr);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

function statusBadge(status) {
  const s = (status || "").toLowerCase();
  if (s === "confirmed") return "bg-green-100 text-green-700";
  if (s === "rejected") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700"; // pending default
}

function MyBookings() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Please Log In</h2>
          <Link to="/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = user?.token || user?.accessToken || "";

      const res = await fetch(`${API_BASE}/api/bookings/my`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load bookings");
      }

      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message || "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  };

  fetchMyBookings();
}, []);

const upcomingBookings = useMemo(() => {
  const now = new Date();
  return bookings
    .map((b) => ({
      ...b,
      providerName:
        b.providerId?.profile?.businessName ||
        b.providerId?.name ||
        b.providerId?.email ||
        "Seller",
    }))
    .filter((b) => {
      const endDT = parseBookingEndDateTime(b.date, b.timeSlot);
      if (!endDT) return true;
      return endDT.getTime() > now.getTime(); // hide past
    });
}, [bookings]);


  return (
    <div className="min-h-screen bg-light">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-dark mb-1">📅 My Bookings</h1>
          <p className="text-sm text-gray-600">
            You can see your booking requests and their updated status here. Past bookings are hidden automatically.
          </p>
        </div>

        {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-lg font-semibold text-dark">Loading bookings...</p>
            </div>
        ) : error ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-lg font-semibold text-red-600">Failed to load bookings</p>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
        ) : upcomingBookings.length === 0 ? (

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">No upcoming bookings</p>
            <p className="text-sm text-gray-600 mt-2">
              Book a seller from their profile to see it here.
            </p>
            <Link
              to="/sellers"
              className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded hover:opacity-90 font-bold"
            >
              Browse Sellers
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((b) => (
              <div key={b._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-dark">{b.providerName}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      📆 {b.date} &nbsp; | &nbsp; 🕒 {b.timeSlot}
                    </p>
                    {b.note ? (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{b.note}</p>
                    ) : null}
                  </div>

                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadge(
                      b.status
                    )}`}
                  >
                    {b.status || "pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
