const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { getRecommendation } = require("../services/symptom-service");

const router = express.Router();

router.get(
  "/recommendation",
  asyncHandler(async (req, res) => {
    const result = await getRecommendation(req.query.symptom);
    res.json(result);
  })
);

module.exports = router;
