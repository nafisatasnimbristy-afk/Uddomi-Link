const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

const createBooking = async (req, res) => {
  try {
    const { providerId, date, timeSlot, note } = req.body;

    console.log("✅ BOOKING ENDPOINT HIT");
    console.log("REQ BODY:", req.body);


    if (!providerId || !date || !timeSlot) {
      return res.status(400).json({ message: 'providerId, date, and timeSlot are required' });
    }

    // provider must exist
    const provider = await User.findById(providerId).select('_id roles name email');
    if (!provider) {
      return res.status(404).json({ message: 'Seller/Provider not found' });
    }

    // Optional: ensure provider is actually a seller
    const isSeller = provider.roles?.includes('business-owner');
    if (!isSeller) {
      return res.status(400).json({ message: 'Selected user is not a seller/service provider' });
    }

    const booking = await Booking.create({
      clientId: req.user._id,
      providerId,
      date,
      timeSlot,
      note: note || '',
      status: 'pending',
    });

    // return populated data (helps UI later)
    const populated = await Booking.findById(booking._id)
      .populate('clientId', 'name email roles')
      .populate('providerId', 'name email roles');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ clientId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('providerId', 'name email roles profile')
      .populate('clientId', 'name email roles');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProviderBookings = async (req, res) => {
  console.log("✅ GET /api/bookings/provider HIT");
  console.log("PROVIDER USER ID:", req.user?._id);
  
  try {
    // Seller/provider sees bookings where providerId = me
    const bookings = await Booking.find({ providerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('clientId', 'name email roles profile')
      .populate('providerId', 'name email roles');
    console.log("BOOKINGS FOUND:", bookings.length);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['confirmed', 'rejected'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use confirmed or rejected.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the provider (seller) can accept/reject their bookings
    if (String(booking.providerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Only allow updating if currently pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be updated' });
    }

    booking.status = status;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('clientId', 'name email roles profile')
      .populate('providerId', 'name email roles profile');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getProviderBookings, updateBookingStatus };

