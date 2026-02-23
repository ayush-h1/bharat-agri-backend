const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["fish", "bee", "poultry", "dairy"],
    required: true
  },
  unitsOwned: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalInvested: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Unit", unitSchema);
