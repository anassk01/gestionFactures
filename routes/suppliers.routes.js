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
const { getSupplierStats } = require("../controllers/stats.controller");

router.post("/", authenticate, createSupplier);
router.get("/", authenticate, getSuppliers);
router.get("/:id", authenticate, getSupplier);
router.put("/:id", authenticate, updateSupplier);
router.delete("/:id", authenticate, deleteSupplier);
//stats
router.get("/:id/stats", authenticate, getSupplierStats);

module.exports = router;
