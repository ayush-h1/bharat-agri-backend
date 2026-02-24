const mongoose = require('mongoose');

const BankDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  upiId: { type: String, required: true },
  accountHolder: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BankDetails', BankDetailsSchema);
