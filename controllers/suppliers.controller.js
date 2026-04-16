const Supplier = require("../models/Suppliers");
const mongoose = require("mongoose");
const checkInput = (inputList, allowedWords) => {
  return inputList.every((word) => allowedWords.includes(word));
};

async function createSupplier(req, res) {
  const reqSupplier = {};
  if (!req.body.name) {
    return res.status(400).json({ message: "name is required" });
  }
  reqSupplier.name = req.body.name;
  if (req.body.contact) reqSupplier.contact = req.body.contact;
  if (req.body.email) reqSupplier.email = req.body.email;
  if (req.body.phone) reqSupplier.phone = req.body.phone;
  if (req.body.address) reqSupplier.address = req.body.address;

  const supplier = await Supplier.create({
    userId: req.user.id,
    ...reqSupplier,
  });

  res.status(201).json(supplier);
}

async function getSuppliers(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  if (limit > 50) {
    return res.status(400).json({ message: "limit cannot be greater than 50" });
  }
  const skip = (page - 1) * limit;
  const totalItems = await Supplier.countDocuments({ userId: req.user.id });
  const totalPages = Math.ceil(totalItems / limit);
  const allSuppliers = await Supplier.find({ userId: req.user.id })
    .limit(limit)
    .skip(skip);
  res.status(200).json({
    allSuppliers,
    pagination: {
      page: page,
      limit: limit,
      totalItems: totalItems,
      totalPages: totalPages,
    },
  });
}

async function getSupplier(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  const oneSupplier = await Supplier.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (oneSupplier === null) {
    return res.status(404).json({ message: "supplier not found " });
  }
  res.status(200).json(oneSupplier);
}

async function updateSupplier(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ message: "you should specify at least one field to update" });
  }
  if (
    !checkInput(Object.keys(req.body), [
      "name",
      "contact",
      "email",
      "phone",
      "address",
    ])
  ) {
    return res.status(400).json({ message: "you should enter valid data" });
  }
  const updatedSupplier = await Supplier.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
    },
    { ...req.body },
    { new: true },
  );
  if (updatedSupplier === null) {
    return res.status(404).json({ message: "supplier not found " });
  }
  res.status(200).json(updatedSupplier);
}

async function deleteSupplier(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  const deteldSupplier = await Supplier.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (deteldSupplier === null) {
    return res.status(404).json({ message: "supplier not found " });
  }
  res.status(200).json(deteldSupplier);
}

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
};
