const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  referralCode: { type: String, unique: true, required: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  walletBalance: { type: Number, default: 0 },      // Available funds
  lockedBalance: { type: Number, default: 0 },      // Invested funds (locked)
  totalInvested: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalReferralEarnings: { type: Number, default: 0 },
  referralCount: { type: Number, default: 0 },
  firstReferralBonusUsed: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ... (hash password and compare methods remain the same)

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);