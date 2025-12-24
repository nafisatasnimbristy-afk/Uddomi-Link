import { useEffect, useState } from "react";

export default function BookSellerModal({ isOpen, onClose, onSubmit, sellerName }) {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 - 11:00");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDate("");
      setTimeSlot("10:00 - 11:00");
      setNote("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ date, timeSlot, note });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-bold text-dark">📅 Book {sellerName || "Seller"}</h2>
          <p className="mt-1 text-sm text-gray-600">
            Choose a date and time slot to request a booking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Time Slot</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            >
              <option value="10:00 - 11:00">10:00 - 11:00</option>
              <option value="11:00 - 12:00">11:00 - 12:00</option>
              <option value="14:00 - 15:00">14:00 - 15:00</option>
              <option value="15:00 - 16:00">15:00 - 16:00</option>
              <option value="16:00 - 17:00">16:00 - 17:00</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Note (optional)</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Briefly describe what you need..."
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
