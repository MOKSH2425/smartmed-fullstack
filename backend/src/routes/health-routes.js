const express = require("express");

const router = express.Router();

router.get("/api", (_req, res) => {
  res.json({
    service: "SmartMed API",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

router.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
