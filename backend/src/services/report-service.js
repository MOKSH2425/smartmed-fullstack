const { mongoose } = require("../db/mongoose");
const { HttpError } = require("../utils/http-error");
const { starterReports } = require("../config/seed-data");
const { ReportModel } = require("../models/report-model");

const sortByDateDescending = (a, b) => new Date(b.date) - new Date(a.date);

const sanitizeReport = (report) => ({
  id: String(report._id),
  userId: String(report.userId),
  title: report.title,
  date: report.date,
  doctorName: report.doctorName,
  type: report.type,
  status: report.status,
  source: report.source || "manual",
  summary: report.summary || "",
  medicine: report.medicine || "",
  advice: report.advice || "",
  specialist: report.specialist || "",
  severity: report.severity || "",
  matchedSymptoms: report.matchedSymptoms || [],
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
});

const todayIso = () => new Date().toISOString().slice(0, 10);

// Creates a real report tied to an actual Symptom Checker result, instead of
// pre-seeding fake data. Only called when the checker produced a confident
// condition match so the reports list stays meaningful.
const createReportFromRecommendation = async (userId, symptomText, result) => {
  const title = result.topCondition?.name || result.symptom || "Symptom Assessment";

  const report = await ReportModel.create({
    userId,
    title,
    date: todayIso(),
    doctorName: "Dr. AI Assistant",
    type: "AI Symptom Report",
    status: "Ready",
    source: "symptom-checker",
    summary: `Generated from a symptom check for: ${symptomText}`,
    medicine: result.medicine || "",
    advice: result.advice || "",
    specialist: result.visit || "",
    severity: result.severity || "",
    matchedSymptoms: result.matchedSymptoms || [],
  });

  return sanitizeReport(report.toObject());
};

const createStarterReportsForUser = async (userId) => {
  const existingCount = await ReportModel.countDocuments({ userId });

  if (existingCount > 0) {
    return;
  }

  await ReportModel.insertMany(
    starterReports.map((report) => ({
      userId,
      ...report,
    }))
  );
};

const listReports = async (userId) => {
  const reports = await ReportModel.find({ userId }).lean();
  return reports.map(sanitizeReport).sort(sortByDateDescending);
};

const getReportById = async (userId, reportId) => {
  if (!mongoose.isValidObjectId(reportId)) {
    throw new HttpError(404, "Medical report was not found.");
  }

  const report = await ReportModel.findOne({ _id: reportId, userId }).lean();

  if (!report) {
    throw new HttpError(404, "Medical report was not found.");
  }

  return sanitizeReport(report);
};

module.exports = {
  createStarterReportsForUser,
  createReportFromRecommendation,
  listReports,
  getReportById,
};
