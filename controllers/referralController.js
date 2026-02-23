const User = require('../models/User');
const Referral = require('../models/Referral');
const Investment = require('../models/Investment');

// @desc    Get referral statistics for logged-in user
// @route   GET /api/referrals/stats
exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count total referrals (users who registered with this user's code)
    const totalReferrals = await User.countDocuments({ referredBy: userId });

    // Count active referrals (those who have made at least one investment)
    const referredUsers = await User.find({ referredBy: userId }).select('_id');
    const referredIds = referredUsers.map(u => u._id);
    const activeReferrals = await Investment.distinct('userId', { userId: { $in: referredIds } });

    // Sum referral earnings
    const earnings = await Referral.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, total: { $sum: '$commissionEarned' } } }
    ]);
    const totalEarned = earnings.length > 0 ? earnings[0].total : 0;

    // Get detailed list of referrals with their status
    const referrals = await User.find({ referredBy: userId }).select('name email createdAt');
    const referralDetails = await Promise.all(referrals.map(async (ref) => {
      const hasInvested = await Investment.exists({ userId: ref._id });
      return {
        name: ref.name,
        email: ref.email,
        joined: ref.createdAt,
        active: !!hasInvested
      };
    }));

    res.json({
      totalReferrals,
      activeReferrals: activeReferrals.length,
      totalEarned,
      referrals: referralDetails
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get referral list with level and commission
// @route   GET /api/referrals/list
exports.getReferralList = async (req, res) => {
  try {
    const referrals = await Referral.find({ userId: req.user.id })
      .populate('referredUserId', 'name email')
      .sort('-createdAt');
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get leaderboard of top referrers
// @route   GET /api/referrals/leaderboard
// @access  Public (or authenticated – you decide)
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals'
        }
      },
      {
        $addFields: {
          referralCount: { $size: '$referrals' }
        }
      },
      {
        $match: { referralCount: { $gt: 0 } } // only users with at least 1 referral
      },
      {
        $sort: { referralCount: -1 }
      },
      {
        $limit: 20 // top 20
      },
      {
        $project: {
          name: 1,
          email: 1,
          referralCount: 1,
          totalReferralEarnings: 1
        }
      }
    ]);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};