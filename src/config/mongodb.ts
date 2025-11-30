import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const connectToMongoDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI; // Use MONGO_URI from .env
    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectToMongoDB;
