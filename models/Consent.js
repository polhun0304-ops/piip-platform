const mongoose = require("mongoose");

const consentSchema = new mongoose.Schema({
  case_id: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },
  type: { type: String, enum: ["location_tracking", "personal_data"] },
  signed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  signed_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Consent", consentSchema);
