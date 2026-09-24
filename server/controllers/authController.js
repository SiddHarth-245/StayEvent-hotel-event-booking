const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { signToken, httpError } = require('../utils/helpers');

const send = (res, status, user) => res.status(status).json({ token: signToken(user._id), user: user.toSafe() });

// POST /api/auth/register   { name, userId, password, phone? }
exports.register = asyncHandler(async (req, res) => {
  const { name, userId, password, phone } = req.body;
  if (!name || !userId || !password) throw httpError(400, 'Name, user ID and password are required');
  if (/\s/.test(userId)) throw httpError(400, 'User ID cannot contain spaces');
  if (await User.findOne({ userId: userId.toLowerCase() })) throw httpError(400, 'That user ID is taken. Try another one');
  const user = await User.create({ name, userId, password, phone });   // role is always "user" here
  send(res, 201, user);
});

// POST /api/auth/login   { userId, password }
exports.login = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) throw httpError(400, 'Enter your user ID and password');
  const user = await User.findOne({ userId: String(userId).toLowerCase().trim() });
  if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Wrong user ID or password');
  send(res, 200, user);
});

// GET /api/auth/me
exports.me = (req, res) => res.json({ user: req.user.toSafe() });

// PUT /api/auth/profile   { name?, phone?, password? }
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;
  if (name) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (password) {
    if (password.length < 4) throw httpError(400, 'Password must be at least 4 characters');
    req.user.password = password;
  }
  await req.user.save();
  res.json({ user: req.user.toSafe() });
});
