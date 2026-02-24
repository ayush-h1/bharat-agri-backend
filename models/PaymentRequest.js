const mongoose = require('mongoose');

const PaymentRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  utr: { type: String, required: true },          // UTR number
  screenshot: { type: String },                    // optional path/URL
  packageInfo: { type: String },                    // e.g., "Silver" if from invest
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  processedAt: Date
});

module.exports = mongoose.model('PaymentRequest', PaymentRequestSchema);
