const mongoose = require("mongoose");

const SupplierShcema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, minlength: 2, required: true },
    contact: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Supplier", SupplierShcema);
