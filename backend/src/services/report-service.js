const crypto = require("crypto");
const { readCollection, updateCollection } = require("../store/file-store");
const { HttpError } = require("../utils/http-error");
const { starterReports } = require("../config/seed-data");

const sortByDateDescending = (a, b) => new Date(b.date) - new Date(a.date);

const createStarterReportsForUser = async (userId) => {
  await updateCollection("reports", async (reports) => {
    const existing = reports.filter((report) => report.userId === userId);

    if (existing.length > 0) {
      return reports;
    }

    const seededReports = starterReports.map((report) => ({
      id: crypto.randomUUID(),
      userId,
      ...report,
      createdAt: new Date().toISOString(),
    }));

    return [...reports, ...seededReports];
  });
};

const listReports = async (userId) => {
  const reports = await readCollection("reports");
  return reports.filter((report) => report.userId === userId).sort(sortByDateDescending);
};

const getReportById = async (userId, reportId) => {
  const reports = await readCollection("reports");
  const report = reports.find((item) => item.userId === userId && item.id === reportId);

  if (!report) {
    throw new HttpError(404, "Medical report was not found.");
  }

  return report;
};

module.exports = {
  createStarterReportsForUser,
  listReports,
  getReportById,
};
