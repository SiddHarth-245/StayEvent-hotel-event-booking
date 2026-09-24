const Booking = require('../models/Booking');
const { HOLD_MINUTES } = require('./helpers');

// Bookings that currently block inventory: Confirmed ones, plus Pending ones still inside the 15-minute payment window
const activeFilter = () => ({
  $or: [
    { status: 'Confirmed' },
    { status: 'Pending', createdAt: { $gt: new Date(Date.now() - HOLD_MINUTES * 60000) } },
  ],
});

// Returns { "Deluxe Room": 3, "Suite": 0, ... } = rooms still free for the given stay
exports.hotelAvailability = async (hotel, checkIn, checkOut, excludeId) => {
  const q = { type: 'hotel', hotel: hotel._id, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn }, ...activeFilter() };
  if (excludeId) q._id = { $ne: excludeId };
  const bookings = await Booking.find(q).select('roomType rooms');
  const result = {};
  hotel.rooms.forEach((r) => {
    const used = bookings.filter((b) => b.roomType === r.name).reduce((s, b) => s + b.rooms, 0);
    result[r.name] = Math.max(0, r.totalRooms - used);
  });
  return result;
};

// A venue can host one event per day
exports.venueAvailable = async (venueId, eventDate, excludeId) => {
  const q = { type: 'venue', venue: venueId, eventDate, ...activeFilter() };
  if (excludeId) q._id = { $ne: excludeId };
  return !(await Booking.exists(q));
};
