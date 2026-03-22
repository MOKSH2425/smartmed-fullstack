const dotenv = require("dotenv");

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const frontendOrigins = parseOrigins(process.env.FRONTEND_URLS);

if (frontendOrigins.length === 0) {
  frontendOrigins.push(process.env.FRONTEND_URL || "http://localhost:5173");
}

const env = {
  appName: "SmartMed API",
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseNumber(process.env.PORT, 5000),
  frontendOrigins,
  tokenSecret: process.env.TOKEN_SECRET || "smartmed-dev-secret-change-me",
  tokenTtlHours: parseNumber(process.env.TOKEN_TTL_HOURS, 24),
  mongoUri: process.env.MONGODB_URI || "",
  frontendDistDir: require("path").join(__dirname, "../../../frontend/dist"),
};

module.exports = { env };
