const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    amount: { type: Number, min: 0.1, required: true },
    dueDate: { type: Date, required: true },
    details: { type: String },
    status: {
      type: String,
      enum: ["unpaid", "paid", "partially_paid"],
      default: "unpaid",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
