const Package = require('../models/Package');

// @desc    Get all active packages
// @route   GET /api/packages
exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a package (admin only)
// @route   POST /api/packages
exports.createPackage = async (req, res) => {
  try {
    const { name, minInvestment, dailyReturnPercent, durationDays } = req.body;
    const pkg = new Package({ name, minInvestment, dailyReturnPercent, durationDays });
    await pkg.save();
    res.status(201).json(pkg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a package (admin only)
// @route   PUT /api/packages/:id
exports.updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a package (admin only)
// @route   DELETE /api/packages/:id
exports.deletePackage = async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
