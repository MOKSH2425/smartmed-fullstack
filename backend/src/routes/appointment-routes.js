const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { requireAuth } = require("../middleware/auth");
const { listAppointments, createAppointment } = require("../services/appointment-service");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const appointments = await listAppointments(req.auth.sub);
    res.json({ appointments });
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const appointment = await createAppointment(req.auth.sub, req.body);
    res.status(201).json({ appointment });
  })
);

module.exports = router;
