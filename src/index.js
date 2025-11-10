import mongoose, { connect } from "mongoose";
import { DB_Name } from "./constants.js";
import connectToDatabase from "./db/index.js";
//require("dotenv").config();
import dotenv from "dotenv";
import app from "./app.js";
dotenv.config({
    path: "./.env"
});
connectToDatabase().then(() => {
    app.on("error", (err) => {
      console.error("❌ Server error:", err);
    });
    app.listen(process.env.PORT || 8080, () => {
      console.log(`✅ Server is running on port ${process.env.PORT || 8080}`);
      console.log(`🚀 API Available at: http://localhost:${process.env.PORT || 8080}/api/v1/users/register`);
    });
}).catch((error) => {
    console.error("❌ Database connection error:", error);
    process.exit(1);
});


// (async () => {
//   try {
//     await mongoose.connect(` ${process.env.MONGO_URI}/${DB_Name}`);
//     console.log("Connected to MongoDB");
//     app.on("error", (err) => {
//       console.error("Server error:", err);
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     }
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// })();