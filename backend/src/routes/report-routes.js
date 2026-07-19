const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { requireAuth } = require("../middleware/auth");
const { listReports, getReportById } = require("../services/report-service");
const { streamReportPdf } = require("../utils/report-pdf");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const reports = await listReports(req.auth.sub);
    res.json({ reports });
  })
);

router.get(
  "/:reportId/download",
  requireAuth,
  asyncHandler(async (req, res) => {
    const report = await getReportById(req.auth.sub, req.params.reportId);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.title.replace(/\s+/g, "-").toLowerCase()}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");
    streamReportPdf(res, report);
  })
);

module.exports = router;
