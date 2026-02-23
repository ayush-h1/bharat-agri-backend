const express = require('express');
const { createInvestment, getUserInvestments, getInvestmentById } = require('../controllers/investmentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createInvestment);
router.get('/user', auth, getUserInvestments);
router.get('/:id', auth, getInvestmentById);

module.exports = router;