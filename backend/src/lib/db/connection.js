import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { logger } from "../logger.js";
let memoryServer;

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5e3
    });
    logger.info("MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    logger.warn(`MongoDB not connected: ${error?.message ?? "Unknown error"}`);
    logger.info("Starting in-memory MongoDB server for development");
    try {
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5e3
      });
      logger.info("MongoDB connected successfully using in-memory server");
      return mongoose.connection;
    } catch (memoryError) {
      logger.error(`In-memory MongoDB failed: ${memoryError?.message ?? "Unknown error"}`);
      throw memoryError;
    }
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
var stdin_default = mongoose;
export {
  connectDB,
  stdin_default as default,
  disconnectDB
};
