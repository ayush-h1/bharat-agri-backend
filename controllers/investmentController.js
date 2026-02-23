const Investment = require('../models/Investment');
const Package = require('../models/package');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');

// ===================== HELPER FUNCTIONS =====================

// Count active referrals (users referred who have invested)
async function countActiveReferrals(userId) {
  const referredUsers = await User.find({ referredBy: userId }).select('_id');
  const userIds = referredUsers.map(u => u._id);
  const investments = await Investment.distinct('userId', { userId: { $in: userIds } });
  return investments.length;
}

// Distribute referral commissions when an investment is made
async function distributeReferralCommissions(investment, invAmount, invUserId) {
  const investor = await User.findById(invUserId);
  if (!investor.referredBy) return; // no referrer

  let currentUserId = investor.referredBy;
  let level = 1;
  const commissionRates = { 1: 0.08, 2: 0.03, 3: 0.02, 4: 0.01 }; // 8%, 3%, 2%, 1%
  const levelRequirements = { 2: 1, 3: 2, 4: 3 }; // active referrals needed for level

  while (currentUserId && level <= 4) {
    const referrer = await User.findById(currentUserId);
    if (!referrer) break;

    // Check level qualification (except level 1)
    if (level > 1) {
      const activeCount = await countActiveReferrals(referrer._id);
      if (activeCount < levelRequirements[level]) {
        currentUserId = referrer.referredBy;
        level++;
        continue;
      }
    }

    // Determine commission rate
    let rate = commissionRates[level];
    // First referral bonus: 25% for level 1
    if (level === 1 && !referrer.firstReferralBonusUsed) {
      rate = 0.25;
      referrer.firstReferralBonusUsed = true;
      await referrer.save();
    }

    const commission = invAmount * rate;

    // Update referrer's wallet and earnings
    referrer.walletBalance += commission;
    referrer.totalReferralEarnings += commission;
    referrer.totalEarned += commission;
    await referrer.save();

    // Record transaction
    await Transaction.create({
      userId: referrer._id,
      type: 'referral_bonus',
      amount: commission,
      relatedId: investment._id,
      description: `Level ${level} referral commission from investment #${investment._id}`
    });

    // Record referral entry
    await Referral.create({
      userId: referrer._id,
      referredUserId: invUserId,
      level,
      commissionEarned: commission
    });

    // Move up the chain
    currentUserId = referrer.referredBy;
    level++;
  }
}

// ===================== MAIN CONTROLLERS =====================

// @desc    Create a new investment
// @route   POST /api/investments
// @access  Private
exports.createInvestment = async (req, res) => {
  try {
    const { packageId, sector, amount } = req.body;
    const userId = req.user.id;

    // Validate package
    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.isActive) {
      return res.status(404).json({ error: 'Package not found' });
    }
    if (amount < pkg.minInvestment) {
      return res.status(400).json({ error: `Minimum investment for this package is ₹${pkg.minInvestment}` });
    }

    // Get user and check balance
    const user = await User.findById(userId);
    if (user.walletBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Move funds from wallet to locked
    user.walletBalance -= amount;
    user.lockedBalance += amount;
    user.totalInvested += amount;
    await user.save();

    // Calculate daily return and end date
    const dailyReturn = (amount * pkg.dailyReturnPercent) / 100;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.durationDays);

    // Create investment record
    const investment = new Investment({
      userId,
      packageId,
      sector,
      amount,
      dailyReturn,
      endDate,
      accruedReturns: 0,
      lastPayoutDate: new Date()
    });
    await investment.save();

    // Record transaction
    await Transaction.create({
      userId,
      type: 'investment',
      amount,
      relatedId: investment._id,
      description: `Invested in ${pkg.name} (${sector})`
    });

    // Distribute referral commissions (async, don't await)
    distributeReferralCommissions(investment, amount, userId).catch(err => console.error('Referral error:', err));

    // Return updated user (so frontend can sync)
    const updatedUser = await User.findById(userId).select('-password');
    res.status(201).json({ investment, user: updatedUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all investments of logged-in user
// @route   GET /api/investments/user
// @access  Private
exports.getUserInvestments = async (req, res) => {
  try {
    // In getUserInvestments
const investments = await Investment.find({ userId: req.user.id })
  .populate('packageId', 'name dailyReturnPercent');
res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single investment by ID
// @route   GET /api/investments/:id
// @access  Private
exports.getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate('packageId', 'name dailyReturnPercent');
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    // Ensure user owns it or is admin
    if (investment.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(investment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all investments (admin only)
// @route   GET /api/investments/all
// @access  Private/Admin
exports.getAllInvestments = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const investments = await Investment.find()
      .populate('userId', 'name email')
      .populate('packageId', 'name');
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};