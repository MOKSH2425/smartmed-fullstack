const { app } = require("./app");
const { env } = require("./config/env");
const { bootstrapData } = require("./bootstrap/seed");
const { connectToDatabase, disconnectFromDatabase } = require("./db/mongoose");

const startServer = async (options = {}) => {
  await connectToDatabase();
  const seedResult = await bootstrapData();
  const port = options.port ?? env.port;

  const server = await new Promise((resolve) => {
    const runningServer = app.listen(port, () => resolve(runningServer));
  });

  const address = server.address();
  const activePort =
    typeof address === "object" && address ? address.port : port;

  console.log(`${env.appName} is running on port ${activePort}.`);

  if (seedResult.seededDemoUser) {
    console.log(
      `Demo login: ${seedResult.seededDemoUser.email} / ${seedResult.seededDemoUser.password}`
    );
  }

  server.on("close", () => {
    disconnectFromDatabase().catch((error) => {
      console.error("Failed to close MongoDB connection cleanly:", error);
    });
  });

  return server;
};

module.exports = { startServer };
