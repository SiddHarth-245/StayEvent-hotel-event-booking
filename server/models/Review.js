const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['hotel', 'venue'], required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    rating: { type: Number, required: true, min: 1, max: 5 },   // 1-5 stars
    comment: { type: String, required: [true, 'Please write a few words'], trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
