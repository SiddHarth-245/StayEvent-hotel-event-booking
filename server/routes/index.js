const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const auth = require('../controllers/authController');
const { hotels, venues } = require('../controllers/catalogController');
const booking = require('../controllers/bookingController');
const payment = require('../controllers/paymentController');
const review = require('../controllers/reviewController');
const admin = require('../controllers/adminController');

const router = express.Router();

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);
router.put('/auth/profile', protect, auth.updateProfile);

// Hotels & venues: browsing is PUBLIC (no login), editing is admin only
[['hotels', hotels], ['venues', venues]].forEach(([path, c]) => {
  router.get(`/${path}`, c.list);
  router.get(`/${path}/cities`, c.cities);
  router.get(`/${path}/:id`, c.get);
  router.get(`/${path}/:id/availability`, c.availability);
  router.post(`/${path}`, protect, adminOnly, c.create);
  router.put(`/${path}/:id`, protect, adminOnly, c.update);
  router.delete(`/${path}/:id`, protect, adminOnly, c.remove);
});

// Bookings (login required)
router.post('/bookings', protect, booking.create);
router.get('/bookings/mine', protect, booking.mine);
router.get('/bookings', protect, adminOnly, booking.all);
router.get('/bookings/:id', protect, booking.get);
router.put('/bookings/:id/cancel', protect, booking.cancel);
router.put('/bookings/:id/status', protect, adminOnly, booking.setStatus);

// Payments
router.post('/payments/pay', protect, payment.pay);
router.get('/payments/mine', protect, payment.mine);
router.get('/payments', protect, adminOnly, payment.all);

// Reviews (reading is public)
router.get('/reviews', review.list);
router.get('/reviews/mine', protect, review.mine);
router.get('/reviews/all', protect, adminOnly, review.all);
router.post('/reviews', protect, review.create);
router.put('/reviews/:id', protect, review.update);
router.delete('/reviews/:id', protect, review.remove);

// Admin
router.get('/admin/stats', protect, adminOnly, admin.stats);
router.get('/admin/users', protect, adminOnly, admin.users);
router.put('/admin/users/:id/role', protect, adminOnly, admin.setRole);
router.delete('/admin/users/:id', protect, adminOnly, admin.deleteUser);

module.exports = router;
