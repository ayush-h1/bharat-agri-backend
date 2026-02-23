const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const MIN_WITHDRAWAL = 3000;
const WC_FEE_PERCENT = 5; // 5%
const SERVICE_FEE_PERCENT = 5; // 5%

// @desc    Request a withdrawal
// @route   POST /api/withdrawals
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({ error: `Minimum withdrawal amount is £${MIN_WITHDRAWAL}` });
    }

    const user = await User.findById(userId);
    if (user.walletBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Calculate fees
    const feeWC = (amount * WC_FEE_PERCENT) / 100;
    const feeService = (amount * SERVICE_FEE_PERCENT) / 100;
    const netAmount = amount - feeWC - feeService;

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId,
      amount,
      feeWC,
      feeService,
      netAmount,
      status: 'pending'
    });
    await withdrawal.save();

    // Optionally, freeze the amount? We'll deduct only when approved.

    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user's withdrawal requests
// @route   GET /api/withdrawals/user
exports.getUserWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.id }).sort('-requestedAt');
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};