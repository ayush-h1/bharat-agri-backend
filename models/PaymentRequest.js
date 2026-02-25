const mongoose = require('mongoose');
const PaymentRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Number,
  utr: String,
  screenshot: String, // optional
  packageInfo: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  processedAt: Date
});
module.exports = mongoose.model('PaymentRequest', PaymentRequestSchema);
