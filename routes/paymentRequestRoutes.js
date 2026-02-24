const express = require('express');
const router = express.Router();
const PaymentRequest = require('../models/PaymentRequest');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer'); // optional, for file uploads

// Configure multer if you want to store screenshots (simplified here)
const upload = multer({ dest: 'uploads/' });

// @desc    Submit a payment request
// @route   POST /api/payment-requests
// @access  Private
router.post('/', auth, upload.single('screenshot'), async (req, res) => {
  try {
    const { amount, utr, packageInfo } = req.body;
    if (!amount || !utr) {
      return res.status(400).json({ error: 'Amount and UTR are required' });
    }

    const paymentRequest = new PaymentRequest({
      userId: req.user.id,
      amount: parseFloat(amount),
      utr,
      packageInfo,
      screenshot: req.file ? req.file.path : null,
      status: 'pending'
    });
    await paymentRequest.save();

    res.status(201).json({ message: 'Payment request submitted', paymentRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get all pending payment requests (admin)
// @route   GET /api/payment-requests/pending
// @access  Private/Admin
router.get('/pending', auth, admin, async (req, res) => {
  try {
    const requests = await PaymentRequest.find({ status: 'pending' })
      .populate('userId', 'name email walletBalance')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Approve a payment request
// @route   POST /api/payment-requests/:id/approve
// @access  Private/Admin
router.post('/:id/approve', auth, admin, async (req, res) => {
  try {
    const request = await PaymentRequest.findById(req.params.id).populate('userId');
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Add funds to user's wallet
    const user = await User.findById(request.userId._id);
    user.walletBalance += request.amount;
    await user.save();

    // Record transaction
    await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount: request.amount,
      description: `Funds added via payment (UTR: ${request.utr})`
    });

    // Update request
    request.status = 'approved';
    request.processedAt = new Date();
    await request.save();

    res.json({ message: 'Payment approved', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Reject a payment request
// @route   POST /api/payment-requests/:id/reject
// @access  Private/Admin
router.post('/:id/reject', auth, admin, async (req, res) => {
  try {
    const request = await PaymentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    request.status = 'rejected';
    request.processedAt = new Date();
    await request.save();

    res.json({ message: 'Payment rejected', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
