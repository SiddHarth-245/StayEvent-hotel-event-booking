const mongoose = require('mongoose');

// Connects to MongoDB using the MONGO_URI from .env
module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stayevent';
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Is MongoDB running? Start it, or use a MongoDB Atlas URI in server/.env');
    process.exit(1);
  }
};
