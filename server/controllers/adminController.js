const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/helpers');

// GET /api/admin/stats
exports.stats = asyncHandler(async (req, res) => {
  const [users, hotels, venues, bookings, reviews] = await Promise.all([
    User.countDocuments({ role: 'user' }), Hotel.countDocuments(), Venue.countDocuments(), Booking.countDocuments(), Review.countDocuments(),
  ]);
  const rev = await Payment.aggregate([{ $match: { status: 'Success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
  const byStatus = await Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const byMethod = await Payment.aggregate([{ $match: { status: { $in: ['Success', 'Pending'] } } }, { $group: { _id: '$method', count: { $sum: 1 }, amount: { $sum: '$amount' } } }]);
  const recent = await Booking.find().sort({ createdAt: -1 }).limit(6)
    .populate('user', 'name').populate('hotel', 'name').populate('venue', 'name');
  res.json({ users, hotels, venues, bookings, reviews, revenue: rev[0]?.total || 0, byStatus, byMethod, recent });
});

// GET /api/admin/users
exports.users = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  const counts = await Booking.aggregate([{ $group: { _id: '$user', n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json(users.map((u) => ({ ...u.toObject(), bookings: map[String(u._id)] || 0 })));
});

// PUT /api/admin/users/:id/role   { role }
exports.setRole = asyncHandler(async (req, res) => {
  if (!['user', 'admin'].includes(req.body.role)) throw httpError(400, 'Invalid role');
  if (String(req.params.id) === String(req.user._id)) throw httpError(400, 'You cannot change your own role');
  const u = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  if (!u) throw httpError(404, 'User not found');
  res.json(u);
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw httpError(400, 'You cannot delete your own account');
  const u = await User.findByIdAndDelete(req.params.id);
  if (!u) throw httpError(404, 'User not found');
  res.json({ message: 'User deleted' });
});
