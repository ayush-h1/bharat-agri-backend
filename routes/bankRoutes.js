const express = require('express');
const router = express.Router();
const BankDetails = require('../models/BankDetails');
const auth = require('../middleware/auth');

// Get user's bank details
router.get('/user/bank-details', auth, async (req, res) => {
  try {
    let details = await BankDetails.findOne({ userId: req.user.id });
    res.json(details || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save/update bank details
router.post('/user/bank-details', auth, async (req, res) => {
  try {
    const { upiId, accountHolder } = req.body;
    
    let details = await BankDetails.findOneAndUpdate(
      { userId: req.user.id },
      { upiId, accountHolder, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
