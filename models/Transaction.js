const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['investment', 'return', 'referral_bonus', 'withdrawal', 'deposit', 'credit'], // added 'deposit' and 'credit'
    required: true
  },
  amount: { type: Number, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId, refPath: 'type' },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
