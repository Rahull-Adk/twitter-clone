import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
const app = express();
const port = process.env.PORT || 4000;
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log("Server is running on port:", port);
  connectDB();
});
