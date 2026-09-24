const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Venue = require('../models/Venue');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const { httpError, parseDate, todayUTC, nightsBetween, makeCode } = require('../utils/helpers');
const { hotelAvailability, venueAvailable } = require('../utils/availability');

const HOTEL_TAX = 0.12;   // 12% GST
const VENUE_TAX = 0.18;   // 18% GST

const populate = (q) => q.populate('hotel', 'name city state address images stars').populate('venue', 'name city state address images capacity');

// POST /api/bookings   (login required) - creates a Pending booking, then the user pays
exports.create = asyncHandler(async (req, res) => {
  const { type, itemId, roomType, rooms = 1, guests = 1, checkIn, checkOut, eventDate, eventType, contact = {}, specialRequests = '' } = req.body;
  if (!['hotel', 'venue'].includes(type)) throw httpError(400, 'Invalid booking type');
  if (!contact.name || !/^\d{10}$/.test(String(contact.phone || '').replace(/\D/g, '').slice(-10)))
    throw httpError(400, 'Enter your name and a valid 10-digit mobile number');

  const data = { user: req.user._id, type, guests: Number(guests), contact, specialRequests, bookingCode: makeCode('SE') };
  data.contact.phone = String(contact.phone).replace(/\D/g, '').slice(-10);

  if (type === 'hotel') {
    const hotel = await Hotel.findById(itemId);
    if (!hotel) throw httpError(404, 'Hotel not found');
    const room = hotel.rooms.find((r) => r.name === roomType);
    if (!room) throw httpError(400, 'Please choose a room type');
    const ci = parseDate(checkIn), co = parseDate(checkOut);
    if (!ci || !co) throw httpError(400, 'Choose check-in and check-out dates');
    if (ci < todayUTC()) throw httpError(400, 'Check-in date cannot be in the past');
    if (co <= ci) throw httpError(400, 'Check-out must be after check-in');
    const nRooms = Math.max(1, Number(rooms));
    if (Number(guests) > room.capacity * nRooms) throw httpError(400, `This room type fits ${room.capacity} guests per room. Add more rooms`);
    // Prevent double booking
    const free = (await hotelAvailability(hotel, ci, co))[room.name];
    if (free < nRooms) throw httpError(409, free === 0 ? 'Sorry, this room is sold out for those dates' : `Only ${free} room(s) left for those dates`);
    const nights = nightsBetween(ci, co);
    const subtotal = room.price * nRooms * nights;
    Object.assign(data, { hotel: hotel._id, roomType: room.name, rooms: nRooms, checkIn: ci, checkOut: co, nights, subtotal });
  } else {
    const venue = await Venue.findById(itemId);
    if (!venue) throw httpError(404, 'Venue not found');
    const d = parseDate(eventDate);
    if (!d) throw httpError(400, 'Choose an event date');
    if (d < todayUTC()) throw httpError(400, 'Event date cannot be in the past');
    if (Number(guests) > venue.capacity) throw httpError(400, `This venue holds up to ${venue.capacity} guests`);
    if (!(await venueAvailable(venue._id, d))) throw httpError(409, 'This venue is already booked on that date');
    Object.assign(data, { venue: venue._id, eventDate: d, eventType: eventType || 'Event', subtotal: venue.pricePerDay });
  }
  data.tax = Math.round(data.subtotal * (type === 'hotel' ? HOTEL_TAX : VENUE_TAX));
  data.amount = data.subtotal + data.tax;
  const booking = await Booking.create(data);
  res.status(201).json(await populate(Booking.findById(booking._id)));
});

// GET /api/bookings/mine
exports.mine = asyncHandler(async (req, res) => {
  res.json(await populate(Booking.find({ user: req.user._id }).sort({ createdAt: -1 })));
});

// GET /api/bookings/:id  (owner or admin)
exports.get = asyncHandler(async (req, res) => {
  const b = await populate(Booking.findById(req.params.id)).populate('user', 'name userId');
  if (!b) throw httpError(404, 'Booking not found');
  if (String(b.user._id) !== String(req.user._id) && req.user.role !== 'admin') throw httpError(403, 'Not your booking');
  const payment = await Payment.findOne({ booking: b._id }).sort({ createdAt: -1 });
  res.json({ ...b.toObject(), payment });
});

// PUT /api/bookings/:id/cancel
// Rule: users can cancel free of charge until 24 hours before the stay/event starts. Admins can always cancel.
exports.cancel = asyncHandler(async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b) throw httpError(404, 'Booking not found');
  const isOwner = String(b.user) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw httpError(403, 'Not your booking');
  if (b.status === 'Cancelled') throw httpError(400, 'Already cancelled');
  const start = b.type === 'hotel' ? b.checkIn : b.eventDate;
  if (req.user.role !== 'admin' && start - Date.now() < 24 * 3600 * 1000)
    throw httpError(400, 'Free cancellation ended 24 hours before the start date. Please contact support');
  b.status = 'Cancelled';
  b.cancelledAt = new Date();
  if (b.paymentStatus === 'Paid') {
    b.paymentStatus = 'Refunded';    // refund is simulated in this demo
    await Payment.updateMany({ booking: b._id, status: 'Success' }, { status: 'Refunded' });
  }
  await b.save();
  res.json(b);
});

// ---------- Admin ----------
exports.all = asyncHandler(async (req, res) => {
  const f = req.query.status ? { status: req.query.status } : {};
  res.json(await populate(Booking.find(f).sort({ createdAt: -1 }).limit(300)).populate('user', 'name userId phone'));
});

exports.setStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) throw httpError(400, 'Invalid status');
  const b = await Booking.findById(req.params.id);
  if (!b) throw httpError(404, 'Booking not found');
  b.status = status;
  if (status === 'Cancelled') { b.cancelledAt = new Date(); if (b.paymentStatus === 'Paid') b.paymentStatus = 'Refunded'; }
  await b.save();
  res.json(b);
});
