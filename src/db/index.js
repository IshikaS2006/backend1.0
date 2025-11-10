import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connectToDatabase = async function connectToDatabase() {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`);
    console.log(`✅ MongoDB Connected! DB Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

export default connectToDatabase;