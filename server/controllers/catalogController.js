const Hotel = require('../models/Hotel');
const Venue = require('../models/Venue');
const asyncHandler = require('../utils/asyncHandler');
const { httpError, parseDate } = require('../utils/helpers');
const { hotelAvailability, venueAvailable } = require('../utils/availability');

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTS = {
  popular: { bookingCount: -1, rating: -1 },
  rating: { rating: -1 },
  price_asc: { priceFrom: 1, pricePerDay: 1 },
  price_desc: { priceFrom: -1, pricePerDay: -1 },
  newest: { createdAt: -1 },
};

// Builds the search / filter query from ?q=&city=&minPrice=&maxPrice=&rating=&amenities=a,b&stars=&type=
function buildFilter(kind, q) {
  const f = {};
  const priceField = kind === 'hotel' ? 'priceFrom' : 'pricePerDay';
  if (q.q) {
    const rx = new RegExp(esc(q.q.trim()), 'i');
    f.$or = [{ name: rx }, { city: rx }, { state: rx }, { address: rx }];
  }
  if (q.city) f.city = new RegExp(`^${esc(q.city)}$`, 'i');
  if (q.minPrice || q.maxPrice) {
    f[priceField] = {};
    if (q.minPrice) f[priceField].$gte = Number(q.minPrice);
    if (q.maxPrice) f[priceField].$lte = Number(q.maxPrice);
  }
  if (q.rating) f.rating = { $gte: Number(q.rating) };
  if (q.stars) f.stars = { $in: String(q.stars).split(',').map(Number) };
  if (q.type && kind === 'hotel') f.propertyType = { $in: String(q.type).split(',') };
  const list = q.amenities || q.facilities;
  if (list) f[kind === 'hotel' ? 'amenities' : 'facilities'] = { $all: String(list).split(',') };
  if (kind === 'venue') {
    if (q.capacity) f.capacity = { $gte: Number(q.capacity) };
    if (q.eventType) f.eventTypes = q.eventType;
  }
  return f;
}

// Creates all the handlers for one model ('hotel' or 'venue')
function makeController(kind) {
  const Model = kind === 'hotel' ? Hotel : Venue;
  const c = {};

  // GET /api/hotels?...  (public)
  c.list = asyncHandler(async (req, res) => {
    const sortKey = SORTS[req.query.sort] || SORTS.popular;
    const sort = {};
    Object.entries(sortKey).forEach(([k, v]) => {
      if ((kind === 'hotel' && k === 'pricePerDay') || (kind === 'venue' && k === 'priceFrom')) return;
      sort[k] = v;
    });
    const limit = Math.min(Number(req.query.limit) || 60, 100);
    const items = await Model.find(buildFilter(kind, req.query)).sort(sort).limit(limit);
    res.json(items);
  });

  // GET /api/hotels/:id  (public)
  c.get = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) throw httpError(404, `${kind} not found`);
    res.json(item);
  });

  // Admin only
  c.create = asyncHandler(async (req, res) => res.status(201).json(await Model.create(req.body)));
  c.update = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) throw httpError(404, `${kind} not found`);
    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  });
  c.remove = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) throw httpError(404, `${kind} not found`);
    res.json({ message: 'Deleted' });
  });

  // GET /api/hotels/cities  -> top destinations with counts (public)
  c.cities = asyncHandler(async (req, res) => {
    const rows = await Model.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 }, state: { $first: '$state' }, image: { $first: { $arrayElemAt: ['$images', 0] } } } },
      { $sort: { count: -1, _id: 1 } },
    ]);
    res.json(rows.map((r) => ({ city: r._id, count: r.count, state: r.state, image: r.image })));
  });

  // GET /api/hotels/:id/availability?checkIn=&checkOut=   or   /venues/:id/availability?date=
  c.availability = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) throw httpError(404, `${kind} not found`);
    if (kind === 'hotel') {
      const ci = parseDate(req.query.checkIn), co = parseDate(req.query.checkOut);
      if (!ci || !co || co <= ci) throw httpError(400, 'Choose valid check-in and check-out dates');
      return res.json({ available: await hotelAvailability(item, ci, co) });
    }
    const d = parseDate(req.query.date);
    if (!d) throw httpError(400, 'Choose an event date');
    res.json({ available: await venueAvailable(item._id, d) });
  });
  return c;
}

exports.hotels = makeController('hotel');
exports.venues = makeController('venue');
