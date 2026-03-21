const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { requireAuth } = require("../middleware/auth");
const { listDoctors, listPreviousDoctors } = require("../services/doctor-service");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const doctors = await listDoctors(req.query);
    res.json({ doctors });
  })
);

router.get(
  "/previous",
  requireAuth,
  asyncHandler(async (req, res) => {
    const doctors = await listPreviousDoctors(req.auth.sub);
    res.json({ doctors });
  })
);

module.exports = router;
