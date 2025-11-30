const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    case_id: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },
    summary: String,
    full_text: String,
    signed_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pdf_url: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Report", reportSchema);
