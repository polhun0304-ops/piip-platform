const mongoose = require("mongoose");

const complianceLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  target_type: String,
  target_id: mongoose.Schema.Types.ObjectId,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ComplianceLog", complianceLogSchema);
