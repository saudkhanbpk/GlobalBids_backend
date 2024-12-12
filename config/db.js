import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUri = process.env.MONGO_URI;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("MONGODB connected:",`${mongoose.connection.host}`);
  } catch (error) {
    console.log("Database:", error.message);
  }
};
