require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');
const { seedData } = require('./seed/seed');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://stay-event-hotel-event-booking-3e7q.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
const dbReady = connectDB().then(async () => {
  if (process.env.AUTO_SEED !== 'false') {
    await seedData(false);
  }
});

// Make sure database is ready before API requests
app.use(async (req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'StayEvent API' });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

// Local development only
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  dbReady.then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 StayEvent API running on http://localhost:${PORT}`);
    });
  });
}

// Vercel needs the Express application exported
module.exports = app;