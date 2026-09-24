require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');
const { seedData } = require('./seed/seed');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'StayEvent API' }));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  if (process.env.AUTO_SEED !== 'false') await seedData(false);   // loads sample data only when the DB is empty
  app.listen(PORT, () => console.log(`🚀 StayEvent API running on http://localhost:${PORT}`));
});
