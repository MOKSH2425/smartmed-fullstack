const { startServer } = require("./src/server");

startServer().catch((error) => {
  console.error("Failed to start SmartMed backend:", error);
  process.exit(1);
});
