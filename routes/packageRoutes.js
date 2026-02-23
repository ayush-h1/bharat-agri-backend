const express = require('express');
const { getPackages, createPackage, updatePackage, deletePackage } = require('../controllers/packageController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/', getPackages);
router.post('/', auth, admin, createPackage);
router.put('/:id', auth, admin, updatePackage);
router.delete('/:id', auth, admin, deletePackage);

module.exports = router;