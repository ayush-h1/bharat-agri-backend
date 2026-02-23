const Transaction = require('../models/Transaction');

// @desc    Get all transactions for logged-in user
// @route   GET /api/transactions/user
// @access  Private
exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort('-createdAt')
      .limit(50); // limit to last 50
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all transactions (admin only)
// @route   GET /api/transactions/all
// @access  Private/Admin
exports.getAllTransactions = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const transactions = await Transaction.find()
      .populate('userId', 'name email')
      .sort('-createdAt');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
