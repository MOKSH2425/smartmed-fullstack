const mongoose = require("mongoose");
const { env } = require("../config/env");

let connectionPromise = null;

const connectToDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is required to start the backend with MongoDB.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  await connectionPromise;
  return mongoose.connection;
};

const disconnectFromDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connectionPromise = null;
};

module.exports = {
  mongoose,
  connectToDatabase,
  disconnectFromDatabase,
};
