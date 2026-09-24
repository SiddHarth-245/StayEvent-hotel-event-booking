const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '' },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    images: [String],
    capacity: { type: Number, required: true, min: 1 },
    facilities: [String],
    eventTypes: [String],                               // Wedding, Conference, Birthday...
    pricePerDay: { type: Number, required: true, min: 0 },
    baseRating: { type: Number, default: 8 },
    baseCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

venueSchema.pre('save', function (next) {
  if (!this.rating) this.rating = this.baseRating;
  if (!this.reviewCount) this.reviewCount = this.baseCount;
  next();
});

module.exports = mongoose.model('Venue', venueSchema);
