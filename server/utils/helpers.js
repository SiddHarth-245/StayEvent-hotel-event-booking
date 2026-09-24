const jwt = require('jsonwebtoken');

exports.signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Throw an error carrying an HTTP status code
exports.httpError = (status, message) => {
  const e = new Error(message);
  e.status = status;
  return e;
};

// "2025-06-20" -> Date at 00:00 UTC (so date maths is never affected by time zones)
exports.parseDate = (s) => {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return isNaN(d) ? null : d;
};

exports.todayUTC = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
};

exports.nightsBetween = (a, b) => Math.round((b - a) / 86400000);

exports.makeCode = (prefix) => prefix + Math.random().toString(36).slice(2, 10).toUpperCase();

// An unpaid "Pending" booking holds the room for 15 minutes only
exports.HOLD_MINUTES = 15;
