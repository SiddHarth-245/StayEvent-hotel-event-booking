const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Venue = require('../models/Venue');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/helpers');

// Recalculate the live average (10-point scale) = seed rating blended with real user reviews (1-5 stars x 2)
async function recalc(review) {
  const Model = review.type === 'hotel' ? Hotel : Venue;
  const key = review.type;
  const item = await Model.findById(review[key]);
  if (!item) return;
  const rows = await Review.find({ [key]: item._id });
  const sum = rows.reduce((s, r) => s + r.rating * 2, 0);
  const total = item.baseCount + rows.length;
  item.rating = total ? Math.round(((item.baseRating * item.baseCount + sum) / total) * 10) / 10 : item.baseRating;
  item.reviewCount = total;
  await item.save();
}

// GET /api/reviews?hotel=ID | ?venue=ID   (public)
exports.list = asyncHandler(async (req, res) => {
  const f = {};
  if (req.query.hotel) f.hotel = req.query.hotel;
  if (req.query.venue) f.venue = req.query.venue;
  res.json(await Review.find(f).sort({ createdAt: -1 }).populate('user', 'name'));
});

// GET /api/reviews/mine
exports.mine = asyncHandler(async (req, res) => {
  res.json(await Review.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('hotel', 'name city images').populate('venue', 'name city images'));
});

// GET /api/reviews/all  (admin)
exports.all = asyncHandler(async (req, res) => {
  res.json(await Review.find().sort({ createdAt: -1 }).limit(300)
    .populate('user', 'name userId').populate('hotel', 'name').populate('venue', 'name'));
});

// POST /api/reviews  { type, itemId, rating, comment }   - only guests with a confirmed booking can review
exports.create = asyncHandler(async (req, res) => {
  const { type, itemId, rating, comment } = req.body;
  if (!['hotel', 'venue'].includes(type)) throw httpError(400, 'Invalid review type');
  const had = await Booking.exists({ user: req.user._id, type, [type]: itemId, status: 'Confirmed' });
  if (!had) throw httpError(403, 'You can review after you have a confirmed booking here');
  if (await Review.exists({ user: req.user._id, [type]: itemId })) throw httpError(400, 'You already reviewed this. You can edit your review instead');
  const review = await Review.create({ user: req.user._id, type, [type]: itemId, rating, comment });
  await recalc(review);
  res.status(201).json(review);
});

// PUT /api/reviews/:id   (owner)
exports.update = asyncHandler(async (req, res) => {
  const r = await Review.findById(req.params.id);
  if (!r) throw httpError(404, 'Review not found');
  if (String(r.user) !== String(req.user._id)) throw httpError(403, 'You can only edit your own review');
  if (req.body.rating) r.rating = req.body.rating;
  if (req.body.comment !== undefined) r.comment = req.body.comment;
  await r.save();
  await recalc(r);
  res.json(r);
});

// DELETE /api/reviews/:id   (owner or admin moderation)
exports.remove = asyncHandler(async (req, res) => {
  const r = await Review.findById(req.params.id);
  if (!r) throw httpError(404, 'Review not found');
  if (String(r.user) !== String(req.user._id) && req.user.role !== 'admin') throw httpError(403, 'Not allowed');
  await r.deleteOne();
  await recalc(r);
  res.json({ message: 'Review deleted' });
});
