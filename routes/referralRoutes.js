const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController'); // ← missing line
const auth = require('../middleware/auth');

// Public route
router.get('/leaderboard', referralController.getLeaderboard);

// Protected routes
router.get('/stats', auth, referralController.getReferralStats);
router.get('/list', auth, referralController.getReferralList);

module.exports = router;