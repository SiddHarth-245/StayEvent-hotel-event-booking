const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['hotel', 'venue'], required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    // hotel fields
    roomType: String,
    rooms: { type: Number, default: 1 },
    checkIn: Date,
    checkOut: Date,
    nights: Number,
    // venue fields
    eventDate: Date,
    eventType: String,
    guests: { type: Number, default: 1 },
    contact: { name: String, phone: String, email: String },
    specialRequests: { type: String, default: '' },
    // money
    subtotal: Number,
    tax: Number,
    amount: Number,
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid', 'Pay at property', 'Refunded'], default: 'Unpaid' },
    paymentMethod: { type: String, default: '' },
    cancelledAt: Date,
  },
  { timestamps: true }
);

bookingSchema.index({ hotel: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ venue: 1, eventDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
