const mongoose = require("mongoose");
const PaymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    amount: { type: Number, min: 0.1, required: true },
    paymentDate: {
      type: Date,
      max: Date.now,
      default: Date.now,
      required: true,
    },
    mode_paiement: { type: String },
    note: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", PaymentSchema);
