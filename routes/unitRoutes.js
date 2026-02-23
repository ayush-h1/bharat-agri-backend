const express = require("express");
const router = express.Router();

const { buyUnit } = require("../controllers/unitcontroller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/buy", authMiddleware, buyUnit);

module.exports = router;
