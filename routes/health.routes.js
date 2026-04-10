const express = require("express");
const router = express.Router();
const {
  workingApi,
  notWorkingApi,
} = require("../controllers/health.controller");

router.get("/", workingApi);

module.exports = router;
