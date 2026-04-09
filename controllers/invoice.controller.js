const Supplier = require("../models/Suppliers");
const Invoice = require("../models/Invoice");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
async function createInvoice(req, res) {
  if (!req.body.supplierId || !req.body.amount || !req.body.dueDate) {
    return res
      .status(400)
      .json({ message: "you should enter all the required fields" });
  }
  if (!mongoose.Types.ObjectId.isValid(req.body.supplierId)) {
    return res.status(400).json({ message: "supplierId is invalid" });
  }
  const supplier = await Supplier.findOne({
    _id: req.body.supplierId,
    userId: req.user.id,
  });
  if (!supplier) {
    return res.status(404).json({ message: "supplier not found" });
  }
  const invoice = await Invoice.create({
    userId: req.user.id,
    supplierId: req.body.supplierId,
    amount: req.body.amount,
    dueDate: req.body.dueDate,
    details: req.body.details,
  });
  res.status(201).json({ invoice });
}

async function getInvoices(req, res) {
  const invoices = await Invoice.find({
    userId: req.user.id,
  }).populate("supplierId", "name email");

  res.status(200).json(invoices);
}

async function getInvoice(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "invalid invoice  " });
  }
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).populate("supplierId", "name email");
  if (!invoice) {
    return res.status(404).json({ message: " invoice not found" });
  }
  res.status(200).json(invoice);
}

async function updateInvoice(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "invalid invoice  " });
  }
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ message: "you should specify at least one field" });
  }
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!invoice) {
    return res.status(400).json({ message: " invoice not found" });
  }
  if (invoice.status === "paid") {
    return res.status(400).json({ message: " u cannot update a paid invoice" });
  }

  if (req.body.amount) invoice.amount = req.body.amount;
  if (req.body.dueDate) invoice.dueDate = req.body.dueDate;
  if (req.body.details) invoice.details = req.body.details;
  await invoice.save();
  await invoice.populate("supplierId", "name email");
  res.status(200).json(invoice);
}

async function deleteInvoice(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "invalid invoice" });
  }

  const deletedInvoice = await Invoice.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  }).populate("supplierId", "name email");

  if (!deletedInvoice) {
    return res.status(404).json({ message: " invoice not founds" });
  }

  const payment = await Payment.exists({ invoiceId: req.params.id });
  if (payment) {
    return res
      .status(400)
      .json({ message: "invoice cannot deleted since it contain Payments" });
  }

  res.status(200).json(deletedInvoice);
}

module.exports = {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
};
