// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require auth + admin
router.use(auth, admin);

// Dashboard stats
router.get('/stats', adminController.getStats);

// Users
router.get('/users', adminController.getAllUsers);
router.post('/users/:id/add-funds', adminController.addFunds); // manual fund addition

// Investments
router.get('/investments', adminController.getAllInvestments);

// Withdrawals
router.get('/withdrawals', adminController.getWithdrawals);
router.put('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.put('/withdrawals/:id/reject', adminController.rejectWithdrawal);

// Payment requests (manual top‑ups)
router.get('/payment-requests', adminController.getPendingPayments);
router.post('/payment-requests/:id/approve', adminController.approvePayment);
router.post('/payment-requests/:id/reject', adminController.rejectPayment);

module.exports = router;


