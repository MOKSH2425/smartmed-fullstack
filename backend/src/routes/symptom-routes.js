const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { requireAuth } = require("../middleware/auth");
const { getRecommendation } = require("../services/symptom-service");
const { createReportFromRecommendation } = require("../services/report-service");
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

    // Only a confident condition match produces a real medical report —
    // fallback/unknown/emergency responses stay out of the Reports section.
    let generatedReport = null;
    if (result.found && result.mode === "condition_match") {
      generatedReport = await createReportFromRecommendation(
        req.auth.sub,
        req.query.symptom,
        result
      );
    }

    res.json({ ...result, historyEntry, generatedReport });
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
