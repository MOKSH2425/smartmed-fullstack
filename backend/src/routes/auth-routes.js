const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { signup, login, getCurrentUser } = require("../services/auth-service");
const { requireAuth } = require("../middleware/auth");
const { createRateLimiter } = require("../middleware/rate-limit");

const router = express.Router();

const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: "Too many authentication attempts. Please try again in a minute.",
});

router.post(
  "/signup",
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const result = await signup(req.body);
    res.status(201).json(result);
  })
);

router.post(
  "/login",
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const result = await login(req.body);
    res.json(result);
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.auth.sub);
    res.json({ user });
  })
);

module.exports = router;
