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
  getAdminStats
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { getAdminStats, getDailyRevenue } = require("../controllers/adminController");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth, admin);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

// Package management
router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);

// Withdrawal management
router.get('/withdrawals/pending', getPendingWithdrawals);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/reject', rejectWithdrawal);


router.get("/revenue", protect, adminOnly, getDailyRevenue);
// Stats
router.get('/stats', getAdminStats);

module.exports = router;


