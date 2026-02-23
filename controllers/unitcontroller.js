const Unit = require("../models/Unit");

// @desc Buy units
// @route POST /api/units/buy
exports.buyUnit = async (req, res) => {
  try {
    const { type, units } = req.body;

    const priceMap = {
      fish: 1000,
      bee: 800,
      poultry: 1200,
      dairy: 2000
    };

    const unitPrice = priceMap[type];

    if (!unitPrice) {
      return res.status(400).json({ msg: "Invalid unit type" });
    }

    const totalInvested = unitPrice * units;

    const newUnit = await Unit.create({
      userId: req.user.id,
      type,
      unitsOwned: units,
      unitPrice,
      totalInvested
    });

    res.status(201).json({
      msg: "Units purchased successfully",
      data: newUnit
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
