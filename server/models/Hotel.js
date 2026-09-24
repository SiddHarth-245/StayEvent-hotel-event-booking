const mongoose = require('mongoose');

// Each hotel has several room types; "totalRooms" = how many rooms of that type exist
const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bed: { type: String, default: '1 double bed' },
  price: { type: Number, required: true, min: 0 },      // per night, in INR
  capacity: { type: Number, default: 2 },
  totalRooms: { type: Number, default: 5, min: 1 },
});

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '' },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    images: [String],
    amenities: [String],
    propertyType: { type: String, default: 'Hotel' },
    stars: { type: Number, min: 1, max: 5, default: 3 },
    rooms: { type: [roomSchema], validate: [(v) => v.length > 0, 'Add at least one room type'] },
    priceFrom: { type: Number, default: 0 },            // lowest room price (auto)
    baseRating: { type: Number, default: 8 },           // seed rating (10-point scale)
    baseCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },               // live average (10-point scale)
    reviewCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },         // used for "Most booked"
  },
  { timestamps: true }
);

hotelSchema.pre('save', function (next) {
  if (this.rooms.length) this.priceFrom = Math.min(...this.rooms.map((r) => r.price));
  if (!this.rating) this.rating = this.baseRating;
  if (!this.reviewCount) this.reviewCount = this.baseCount;
  next();
});

module.exports = mongoose.model('Hotel', hotelSchema);
