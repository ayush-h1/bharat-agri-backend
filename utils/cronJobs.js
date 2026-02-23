const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

cron.schedule('5 0 * * *', async () => {
  console.log('Running daily investment processing...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const investments = await Investment.find({ status: 'active' });

    for (const inv of investments) {
      const user = await User.findById(inv.userId);
      if (!user) continue;

      if (inv.endDate < today) {
        // Matured: release principal + accrued returns
        const totalPayout = inv.amount + inv.accruedReturns;
        user.walletBalance += totalPayout;
        user.lockedBalance -= inv.amount;
        user.totalEarned += inv.accruedReturns;
        await user.save();

        inv.status = 'completed';
        await inv.save();

        await Transaction.create({
          userId: user._id,
          type: 'return',
          amount: totalPayout,
          relatedId: inv._id,
          description: `Investment matured: ₹${inv.amount} principal + ₹${inv.accruedReturns} returns`
        });
      } else {
        // Active: add daily return to accruedReturns
        inv.accruedReturns += inv.dailyReturn;
        await inv.save();
      }
    }
    console.log('Daily processing completed.');
  } catch (error) {
    console.error('Cron job error:', error);
  }
});