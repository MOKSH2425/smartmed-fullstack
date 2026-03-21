const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { env } = require("./config/env");
const healthRoutes = require("./routes/health-routes");
const authRoutes = require("./routes/auth-routes");
const doctorRoutes = require("./routes/doctor-routes");
const appointmentRoutes = require("./routes/appointment-routes");
const userRoutes = require("./routes/user-routes");
const reportRoutes = require("./routes/report-routes");
const symptomRoutes = require("./routes/symptom-routes");
const chatRoutes = require("./routes/chat-routes");
const { notFoundHandler, errorHandler } = require("./middleware/error-handler");

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.frontendOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Request origin is not allowed by CORS."));
    },
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.use("/", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/chat", chatRoutes);

if (env.nodeEnv === "production" && fs.existsSync(env.frontendDistDir)) {
  app.use(express.static(env.frontendDistDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(env.frontendDistDir, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
