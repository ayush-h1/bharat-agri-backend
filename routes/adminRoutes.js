const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(auth, admin);

// Dashboard
router.get('/stats', adminController.getAdminStats);
router.get('/revenue', adminController.getDailyRevenue);

// Users
router.get('/users', adminController.getAllUsers);
router.post('/users/:id/add-funds', adminController.addFunds);

// Investments
router.get('/investments', adminController.getAllInvestments);

// Withdrawals
router.get('/withdrawals', adminController.getPendingWithdrawals);
router.put('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.put('/withdrawals/:id/reject', adminController.rejectWithdrawal);

// Payments
router.get('/payment-requests', adminController.getPendingPayments);
router.post('/payment-requests/:id/approve', adminController.approvePayment);
router.post('/payment-requests/:id/reject', adminController.rejectPayment);

module.exports = router;


