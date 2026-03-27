const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { requireAuth } = require("../middleware/auth");
const { getRecommendation } = require("../services/symptom-service");
const {
  addRecommendationHistory,
  getRecommendationHistory,
} = require("../services/user-service");

const router = express.Router();

router.get(
  "/recommendation",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await getRecommendation(req.query.symptom);
    const historyEntry = result.found
      ? await addRecommendationHistory(req.auth.sub, {
          query: req.query.symptom,
          recommendation: result,
        })
      : null;
    res.json({ ...result, historyEntry });
  })
);

router.get(
  "/history",
  requireAuth,
  asyncHandler(async (req, res) => {
    const history = await getRecommendationHistory(req.auth.sub);
    res.json({ history });
  })
);

module.exports = router;
