const express = require('express');
const {
  getAllUsers,
  updateUser,
  createPackage,
  updatePackage,
  deletePackage,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getAdminStats,
  getDailyRevenue
} = require('../controllers/adminController');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth, admin);

// ================= USER MANAGEMENT =================
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

// ================= PACKAGE MANAGEMENT =================
router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);

// ================= WITHDRAWAL MANAGEMENT =================
router.get('/withdrawals/pending', getPendingWithdrawals);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/reject', rejectWithdrawal);

// ================= ADMIN ANALYTICS =================
router.get('/stats', getAdminStats);
router.get('/revenue', getDailyRevenue);

module.exports = router;


