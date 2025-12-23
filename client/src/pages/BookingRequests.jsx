import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function BookingRequests() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isSeller = user?.roles?.includes("business-owner");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token =
    user?.token ||
    user?.accessToken ||
    user?.jwt ||
    localStorage.getItem("token") ||
    "";

  // 1) Guard screens
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

  if (!isSeller) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg">
          <h2 className="text-xl font-bold text-dark mb-2">Access denied</h2>
          <p className="text-sm text-gray-600 mt-2">
            This page is only for sellers (business owners).
          </p>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <div>Debug: userId={user?._id}</div>
            <div>Debug: roles={JSON.stringify(user?.roles)}</div>
            <div>Debug: tokenPresent={String(!!token)}</div>
          </div>
          <Link to="/dashboard" className="inline-block mt-4 text-primary hover:underline">
            Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 2) Fetch provider bookings
  useEffect(() => {
    const fetchProviderBookings = async () => {
      try {
        setLoading(true);
        setError("");
        setMsg("");

        if (!token) {
          throw new Error("No auth token found. Please log out and log in again as seller.");
        }

        const res = await fetch(`${API_BASE}/api/bookings/provider`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load booking requests");
        }

        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Could not load booking requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderBookings();
  }, []);

  const pendingRequests = useMemo(() => {
    return requests.filter((r) => (r.status || "").toLowerCase() === "pending");
  }, [requests]);

  // 3) Update booking status
  const updateStatus = async (id, newStatus) => {
    try {
      setError("");
      setMsg("");

      if (!token) {
        throw new Error("No auth token found. Please log out and log in again as seller.");
      }

      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update booking");
      }

      const updated = await res.json();

      // Replace updated booking locally so pending list auto-refreshes
      setRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));

      setMsg(`Booking ${newStatus}.`);
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      setError(err.message || "Could not update booking.");
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="container mx-auto px-4 py-8">
        

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-dark mb-1">📩 Booking Requests</h1>
          <p className="text-sm text-gray-600">
            Pending booking requests from users will appear here. Accept or reject them.
          </p>

          

          {msg ? (
            <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{msg}</div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">Loading booking requests...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">No pending booking requests</p>
            <p className="text-sm text-gray-600 mt-2">
              When users request bookings, they will appear here.
            </p>
            <Link
              to="/dashboard"
              className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded hover:opacity-90 font-bold"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((r) => (
              <div key={r._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-dark">
                      {r.clientId?.name || r.clientId?.email || "Client"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      ✉️ {r.clientId?.email || "N/A"}
                    </p>

                    <p className="text-sm text-gray-600 mt-2">
                      📆 {r.date} &nbsp; | &nbsp; 🕒 {r.timeSlot}
                    </p>

                    {r.note ? (
                      <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
                        <span className="font-semibold">Note: </span>
                        {r.note}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <button
                      onClick={() => updateStatus(r._id, "confirmed")}
                      className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => updateStatus(r._id, "rejected")}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
