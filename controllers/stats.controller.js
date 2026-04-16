const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Supplier = require("../models/Suppliers");
const Payment = require("../models/Payment");

async function getSupplierStats(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "supplierId not valid" });
  }
  const supplier = await Supplier.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!supplier) {
    return res.status(404).json({ message: "supplier not found" });
  }

  const invoices = await Invoice.find({
    supplierId: req.params.id,
    userId: req.user.id,
  });

  const invoiceIds = invoices.map((inv) => inv._id);
  const payments = await Payment.find({ invoiceId: { $in: invoiceIds } });

  // stats calculation
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRemaining = totalAmount - totalPaid;
  const percentPaid =
    totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  //status
  const unpaid = invoices.filter((f) => f.status === "unpaid");
  const overdue = invoices.filter(
    (f) => f.status !== "paid" && new Date(f.dueDate) < new Date(Date.now()),
  );
  const paid = invoices.filter((f) => f.status === "paid");
  const partially_paid = invoices.filter((f) => f.status === "partially_paid");
  const overdueAmount = overdue.reduce((acc, curr) => acc + curr.amount, 0);

  const invoicesByStatus = {
    unpaid: unpaid.length,
    paid: paid.length,
    partially_paid: partially_paid.length,
    overdue: overdue.length,
  };

  res.status(200).json({
    totalInvoices: totalInvoices,
    totalAmount: totalAmount,
    totalPaid: totalPaid,
    totalRemaining: totalRemaining,
    percentPaid: percentPaid,
    overdueAmount: overdueAmount,
    invoicesByStatus: invoicesByStatus,
  });
}

async function getDashboard(req, res) {
  const suppliers = await Supplier.find({ userId: req.user.id });
  const invoices = await Invoice.find({ userId: req.user.id });

  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const invoiceIds = invoices.map((inv) => inv._id);
  const payments = await Payment.find({ invoiceId: { $in: invoiceIds } });
  const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRemaining = totalAmount - totalPaid;

  const overdue = invoices.filter(
    (f) => f.status !== "paid" && new Date(f.dueDate) < new Date(Date.now()),
  );
  const overdueCount = overdue.length;
  const overdueAmount = overdue.reduce((acc, curr) => acc + curr.amount, 0);

  //status
  const unpaid = invoices.filter((f) => f.status === "unpaid");
  const paid = invoices.filter((f) => f.status === "paid");
  const partially_paid = invoices.filter((f) => f.status === "partially_paid");

  const invoicesByStatus = {
    unpaid: unpaid.length,
    paid: paid.length,
    partially_paid: partially_paid.length,
    overdue: overdue.length,
  };

  // suppliers
  const totalSuppliers = suppliers.length;
  const suppliersInoices = invoices.reduce((acc, curr) => {
    const total = acc[curr.supplierId] || 0;
    const supplierId = curr.supplierId;
    return { ...acc, [curr.supplierId]: total + curr.amount };
  }, {});

  const suppliersInoicesEntries = Object.entries(suppliersInoices);
  const sortedSuppliers = suppliersInoicesEntries.sort((a, b) => b[1] - a[1]);
  const top3Suppliers = sortedSuppliers.slice(0, 3);
  const topSuppliers = top3Suppliers
    .map((m) => {
      const supplier = suppliers.find((s) => s._id.toString() === m[0].toString());
      if (!supplier) return null;
      return { name: supplier.name, totalAmount: m[1] };
    })
    .filter((s) => s !== null);

  res.status(200).json({
    totalSuppliers: totalSuppliers,
    totalInvoices: totalInvoices,
    totalAmount: totalAmount,
    totalPaid: totalPaid,
    totalRemaining: totalRemaining,
    overdueAmount: overdueAmount,
    overdueCount: overdueCount,
    invoicesByStatus: invoicesByStatus,
    topSuppliers: topSuppliers,
  });
}

module.exports = { getSupplierStats, getDashboard };
