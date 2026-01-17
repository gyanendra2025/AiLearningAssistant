import dotenv from "dotenv";
dotenv.config();

import express from "express";

import cors from "cors";
import path from "path";
import errorHandler from "./middlewares/errorHandler.js";

import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

connectDB();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["content-type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static folder for upload
app.use("/upload", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: "false",
    error: "Route not found",
    statusCode: 404,
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`backend server is running on ${PORT} `);
});

process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
