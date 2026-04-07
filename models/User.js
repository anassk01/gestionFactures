const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, minlength: 2, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, minlength: 8, required: true },
    role: { type: String, enum: ["admin", "client"], default: "client" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
