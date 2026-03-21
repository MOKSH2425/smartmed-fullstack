const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { requireAuth } = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
} = require("../services/user-service");

const router = express.Router();

router.get(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await getProfile(req.auth.sub);
    res.json({ profile });
  })
);

router.put(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await updateProfile(req.auth.sub, req.body);
    res.json({ profile, message: "Profile updated successfully." });
  })
);

router.get(
  "/settings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const settings = await getSettings(req.auth.sub);
    res.json({ settings });
  })
);

router.put(
  "/settings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const settings = await updateSettings(req.auth.sub, req.body);
    res.json({ settings, message: "Settings updated successfully." });
  })
);

module.exports = router;
