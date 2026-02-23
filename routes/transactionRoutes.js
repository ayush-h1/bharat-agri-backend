const express = require('express');
const router = express.Router();
const { getUserTransactions, getAllTransactions } = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/user', auth, getUserTransactions);
router.get('/all', auth, admin, getAllTransactions);

module.exports = router;
