const router = require("express").Router();
const authenticate = require("../middlewares/auth.middleware");
const {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoice.controller");
const {
  addPayment,
  getPayments,
} = require("../controllers/payment.controller");

router.post("/", authenticate, createInvoice);
router.get("/", authenticate, getInvoices);
router.get("/:id", authenticate, getInvoice);
router.put("/:id", authenticate, updateInvoice);
router.delete("/:id", authenticate, deleteInvoice);

router.post("/:id/payments", authenticate, addPayment);
router.get("/:id/payments", authenticate, getPayments);

module.exports = router;
