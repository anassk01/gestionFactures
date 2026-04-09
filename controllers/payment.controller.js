const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

async function addPayment(req, res) {
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ message: "you should at least provide one field" });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid invoice ID format" });
  }

  if (!req.body.amount || !req.body.paymentDate) {
    return res.status(400).json({ message: "youre missing mendatory fields " });
  }
  if (new Date(req.body.paymentDate) > new Date(Date.now())) {
    return res
      .status(400)
      .json({ message: "payment date cannot be in  the future " });
  }
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!invoice) {
    return res.status(404).json({ message: "invoice not found " });
  }
  if (invoice.status === "paid") {
    return res.status(400).json({ message: "this invoice already paid " });
  }
  const payments = await Payment.find({
    invoiceId: req.params.id,
  });

  const sumInvoicePayments = payments.reduce((acc, curr) => {
    return acc + curr.amount;
  }, 0);
  if (sumInvoicePayments + req.body.amount > invoice.amount) {
    return res
      .status(400)
      .json({ message: "payements exceed the invoice amount " });
  }
  if (sumInvoicePayments + req.body.amount === invoice.amount) {
    invoice.status = "paid";
  }

  if (sumInvoicePayments + req.body.amount < invoice.amount) {
    invoice.status = "partially_paid";
  }
  const payment = {};
  payment.invoiceId = req.params.id;
  payment.amount = req.body.amount;
  payment.paymentDate = req.body.paymentDate;

  if (req.body.mode_paiement) payment.mode_paiement = req.body.mode_paiement;
  if (req.body.note) payment.note = req.body.note;
  const createdPayment = await Payment.create(payment);
  await invoice.save();
  res.status(201).json({ payment: createdPayment, invoice });
}

async function getPayments(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "invoice id is not valid " });
  }
  const currentInvoice = await Invoice.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!currentInvoice) {
    return res.status(404).json({ message: "invoice not found" });
  }
  const payments = await Payment.find({ invoiceId: req.params.id });
  if (payments.length === 0) {
    return res
      .status(404)
      .json({ message: "no payments found for this invoice" });
  }
  res.status(200).json(payments);
}

module.exports = { addPayment, getPayments };
