const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet', 'cod'], required: true },
    methodDetail: { type: String, default: '' },   // masked: "ra***@okhdfc", "•••• 4242", "HDFC Bank"
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Success', 'Failed', 'Pending', 'Refunded'], required: true },
    transactionId: { type: String, required: true },
    failureReason: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
