import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./db/connectDB.js";
const app = express();
const port = process.env.PORT || 4000;
dotenv.config();

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log("Server is running on port:", port);
  connectDB();
});
