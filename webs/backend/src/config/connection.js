import mongoose from "mongoose";
import logger from "../logger/logger.js";
/**
  The connectDB function is an async function that takes a URL parameter. 
  This function uses the mongoose.connect method to connect to the MongoDB database. 
  If the connection is successful, it logs a message to the console. 
  If there is an error, it logs the error message and exits the process with an exit code of 1.
*/
const connectDB = async (url) => {
  try {
    const conn = await mongoose.connect(url, {
      dbName: 'learning-app',
    });
    // logger.info(`MongoDB Connected`);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default connectDB;