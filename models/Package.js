const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Silver', 'Gold', 'Diamond'],
    unique: true
  },
  minInvestment: {
    type: Number,
    required: true
  },
  dailyReturnPercent: {
    type: Number,
    required: true
  },
  durationDays: {
    type: Number,
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Package', PackageSchema);