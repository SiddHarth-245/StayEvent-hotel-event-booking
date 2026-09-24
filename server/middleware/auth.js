const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/helpers');

// Requires a valid login token
exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw httpError(401, 'Please sign in to continue');
  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'dev_secret');
  } catch {
    throw httpError(401, 'Your session has expired. Please sign in again');
  }
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, 'Account not found');
  req.user = user;
  next();
});

// Only admins can pass
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  next(httpError(403, 'Admin access only'));
};
