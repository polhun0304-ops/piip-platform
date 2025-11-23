const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    type: { type: String, enum: ["infidelity", "missing", "corporate"] },
    status: {
      type: String,
      enum: ["received", "in_progress", "completed"],
      default: "received",
    },
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assigned_investigator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
