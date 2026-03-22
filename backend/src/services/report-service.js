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
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
});

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
  listReports,
  getReportById,
};
