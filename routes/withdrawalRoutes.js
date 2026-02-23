const express = require('express');
const { requestWithdrawal, getUserWithdrawals } = require('../controllers/withdrawalController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, requestWithdrawal);
router.get('/user', auth, getUserWithdrawals);

module.exports = router;