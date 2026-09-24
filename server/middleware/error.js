exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

// Central error handler: every error becomes { message } JSON
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.name === 'CastError') { status = 404; message = 'Resource not found'; }
  if (err.code === 11000) { status = 400; message = 'That value is already taken'; }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
