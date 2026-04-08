const express = require("express");
const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/suppliers.controller");

router.post("/", authenticate, createSupplier);
router.get("/", authenticate, getSuppliers);
router.get("/:id", authenticate, getSupplier);
router.put("/:id", authenticate, updateSupplier);
router.delete("/:id", authenticate, deleteSupplier);

module.exports = router;
