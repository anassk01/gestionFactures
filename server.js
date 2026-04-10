require("dotenv").config();
const express = require("express");
const cnDb = require("./config/db");

const healthCheck = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const supplierRoutes = require("./routes/suppliers.routes");
const invoiceRoutes = require("./routes/invoices.routes");

const app = express();

app.use(express.json());
app.use("/api", healthCheck);
app.use("/api/auth", authRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/invoices", invoiceRoutes);

//last one
app.use((req, res) => {
  res.status(404).send({ message: `endpoint not found` });
});

async function startServer() {
  await cnDb();
  app.listen(process.env.PORT || 4001, () => {
    console.log(`server running at port ${process.env.PORT}`);
  });
}

startServer();
