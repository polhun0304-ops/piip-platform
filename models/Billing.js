const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    case_id: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },
    amount: Number,
    status: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    payment_method: String,
    invoice_url: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Billing", billingSchema);
