const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Hotel = require('../models/Hotel');
const Venue = require('../models/Venue');
const asyncHandler = require('../utils/asyncHandler');
const { httpError, makeCode, HOLD_MINUTES } = require('../utils/helpers');

/*
  DEMO PAYMENT GATEWAY
  --------------------
  This simulates a real gateway (like Razorpay / Stripe test mode) so the project runs with NO API keys.
  Supported methods: upi, card, netbanking, wallet (mobile banking), cod (pay at property).

  Try these in the demo:
    UPI       any id like  name@okhdfc      | ends with "@fail"  -> payment declined
    Card      any 16 digits, future expiry  | 4000 0000 0000 0002 -> card declined
    Net bank  choose any bank
    Wallet    choose a wallet + 10-digit mobile number
  To use real Razorpay later, replace the "simulate" block below with the Razorpay order/verify calls.
*/
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mask = (s, keep = 2) => s.slice(0, keep) + '***' + s.slice(s.indexOf('@'));

// returns { detail } if valid, throws httpError(400) for bad input, or { declined: 'reason' }
function checkMethod(method, d = {}) {
  switch (method) {
    case 'upi': {
      const vpa = String(d.vpa || '').trim();
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(vpa)) throw httpError(400, 'Enter a valid UPI ID, for example name@okhdfc');
      if (vpa.toLowerCase().endsWith('@fail')) return { detail: mask(vpa), declined: 'UPI request was declined by the bank' };
      return { detail: mask(vpa) };
    }
    case 'card': {
      const num = String(d.number || '').replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(num)) throw httpError(400, 'Enter a valid card number');
      const m = String(d.expiry || '').match(/^(\d{2})\s*\/\s*(\d{2})$/);
      if (!m || +m[1] < 1 || +m[1] > 12) throw httpError(400, 'Enter expiry as MM/YY');
      if (new Date(2000 + +m[2], +m[1], 1) <= new Date()) throw httpError(400, 'This card has expired');
      if (!/^\d{3,4}$/.test(String(d.cvv || ''))) throw httpError(400, 'Enter the 3-digit CVV');
      if (!String(d.name || '').trim()) throw httpError(400, 'Enter the name on the card');
      const detail = `•••• ${num.slice(-4)}`;
      return num === '4000000000000002' ? { detail, declined: 'Your card was declined. Try another card' } : { detail };
    }
    case 'netbanking':
      if (!d.bank) throw httpError(400, 'Choose your bank');
      return { detail: d.bank };
    case 'wallet':
      if (!d.provider) throw httpError(400, 'Choose a wallet or mobile banking app');
      if (!/^\d{10}$/.test(String(d.mobile || ''))) throw httpError(400, 'Enter the 10-digit mobile number linked to your account');
      return { detail: `${d.provider} • ${String(d.mobile).slice(0, 2)}******${String(d.mobile).slice(-2)}` };
    case 'cod':
      return { detail: 'Pay at property' };
    default:
      throw httpError(400, 'Choose a payment method');
  }
}

// POST /api/payments/pay   { bookingId, method, details }
exports.pay = asyncHandler(async (req, res) => {
  const { bookingId, method, details } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking || String(booking.user) !== String(req.user._id)) throw httpError(404, 'Booking not found');
  if (booking.status === 'Confirmed') throw httpError(400, 'This booking is already confirmed');
  if (booking.status === 'Cancelled') throw httpError(400, 'This booking was cancelled. Please book again');
  if (Date.now() - booking.createdAt > HOLD_MINUTES * 60000) {
    booking.status = 'Cancelled';
    await booking.save();
    throw httpError(410, 'Your payment window (15 minutes) expired and the room was released. Please book again');
  }

  const chk = checkMethod(method, details);
  const base = { booking: booking._id, user: req.user._id, method, methodDetail: chk.detail, amount: booking.amount, transactionId: makeCode(method === 'cod' ? 'PAH' : 'TXN') };

  // Pay at property: no online payment, booking is confirmed straight away
  if (method === 'cod') {
    const payment = await Payment.create({ ...base, status: 'Pending' });
    booking.status = 'Confirmed';
    booking.paymentStatus = 'Pay at property';
    booking.paymentMethod = 'cod';
    await booking.save();
    await bump(booking);
    return res.json({ booking, payment });
  }

  await sleep(1800);   // pretend to talk to the bank

  if (chk.declined) {
    const payment = await Payment.create({ ...base, status: 'Failed', failureReason: chk.declined });
    return res.status(402).json({ message: chk.declined, payment });
  }
  const payment = await Payment.create({ ...base, status: 'Success' });
  booking.status = 'Confirmed';
  booking.paymentStatus = 'Paid';
  booking.paymentMethod = method;
  await booking.save();
  await bump(booking);
  res.json({ booking, payment });
});

// increases "bookingCount" so the item shows up in "Most booked"
const bump = (b) => (b.type === 'hotel' ? Hotel : Venue).findByIdAndUpdate(b.hotel || b.venue, { $inc: { bookingCount: 1 } });

// GET /api/payments/mine
exports.mine = asyncHandler(async (req, res) => {
  res.json(await Payment.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

// GET /api/payments  (admin)
exports.all = asyncHandler(async (req, res) => {
  res.json(await Payment.find().sort({ createdAt: -1 }).limit(300)
    .populate('user', 'name userId').populate('booking', 'bookingCode type'));
});
