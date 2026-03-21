const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { requireAuth } = require("../middleware/auth");
const { getCurrentUser } = require("../services/auth-service");
const { getChatReply } = require("../services/chat-service");
const { createRateLimiter } = require("../middleware/rate-limit");

const router = express.Router();

const chatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many chat requests. Please slow down and try again shortly.",
});

router.post(
  "/",
  requireAuth,
  chatRateLimiter,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.auth.sub);
    const result = await getChatReply({
      userName: user.name,
      message: req.body.message,
    });

    res.json(result);
  })
);

module.exports = router;
