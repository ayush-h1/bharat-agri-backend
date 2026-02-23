const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  sector: {
    type: String,
    enum: ['Fish', 'Bee', 'Poultry', 'Dairy'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dailyReturn: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  nextPayoutDate: {
    type: Date,
    default: Date.now
  },
  lastPayoutDate: {
  type: Date,
  default: function() {
    return this.startDate; // new investments start accruing from startDate
  }
},
 // ... existing fields ...
  lastPayoutDate: {
    type: Date,
    default: function() {
      return this.startDate; // so accrual starts from investment creation
    }
  }
});

module.exports = mongoose.model('Investment', InvestmentSchema);