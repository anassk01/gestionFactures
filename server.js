require("dotenv").config();
const express = require("express");
const cnDb = require("./config/db");

const app = express();

app.use(express.json());

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
