const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    case_id: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },
    type: { type: String, enum: ["image", "video", "audio", "document"] },
    file_url: String,
    metadata: {
      GPS: String,
      timestamp: Date,
      device_hash: String,
    },
    ai_tags: mongoose.Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Evidence", evidenceSchema);
