const User = require('../models/User');
const Package = require('../models/Package');
const Withdrawal = require('../models/Withdrawal');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');

// User management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { walletBalance, isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { walletBalance, isAdmin },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Package management
exports.createPackage = async (req, res) => {
  try {
    const pkg = new Package(req.body);
    await pkg.save();
    res.status(201).json(pkg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Withdrawal management
exports.getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('userId', 'name email walletBalance')
      .sort('-requestedAt');
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }

    const user = await User.findById(withdrawal.userId);
    if (user.walletBalance < withdrawal.amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct amount from wallet
    user.walletBalance -= withdrawal.amount;
    await user.save();

    // Update withdrawal
    withdrawal.status = 'approved';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Record transaction
    await Transaction.create({
      userId: user._id,
      type: 'withdrawal',
      amount: withdrawal.amount,
      relatedId: withdrawal._id,
      description: `Withdrawal approved: £${withdrawal.netAmount} (after fees)`
    });

    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }

    withdrawal.status = 'rejected';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dashboard stats

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalInvestments = await Investment.countDocuments();

    const totalInvestedAgg = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalInvested = totalInvestedAgg[0]?.total || 0;

    const totalEarningsAgg = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPaid" } } }
    ]);
    const totalEarnings = totalEarningsAgg[0]?.total || 0;

    const pendingWithdrawals = await Withdrawal.countDocuments({ status: "pending" });

    const totalWithdrawnAgg = await Withdrawal.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalWithdrawn = totalWithdrawnAgg[0]?.total || 0;

    res.json({
      totalUsers,
      totalInvestments,
      totalInvested,
      totalEarnings,
      totalWithdrawn,
      pendingWithdrawals
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
