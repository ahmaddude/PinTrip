import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {connectDB} from "./lib/db.js"
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js"
import cookieParser from 'cookie-parser';
import pinRouter from "./routes/pinRoutes.js";
import http from "http";
import { initSocket } from "./utils/socket.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

const requiredEnvVars = ["MONGO_DB", "JWT_SECRET"];
for (const v of requiredEnvVars) {
  if (!process.env[v]) {
    console.error(`Missing required env var: ${v}`);
    process.exit(1);
  }
}

const PORT=process.env.PORT||5000;

const app=express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/verify", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api", generalLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/pin", pinRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

server.listen(PORT,()=>{
    connectDB();
    console.log("server connected on " , PORT)
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.connection.close(false);
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.connection.close(false);
    process.exit(0);
  });
});
