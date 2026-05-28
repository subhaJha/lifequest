const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Prefer the newer authRoutes.js, but fall back to auth.js (older/alternate implementation)
let authRoutes;
try {
  authRoutes = require("./routes/authRoutes.js");
} catch (err) {
  authRoutes = require("./routes/auth.js");
}

const userRoutes = require("./routes/userRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");

const app = express();

// MIDDLEWARE
app.use((req, res, next) => {
  // Controls how much Referrer information browsers send for cross-origin requests
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// CORS: allow frontend + Vercel preview domains
const allowedOrigins = [
  "https://lifequest-snowy.vercel.app",
  "https://lifequest-8ccl.vercel.app",
  "https://lifequest-z383.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// Avoid reconnecting on every invocation
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL env var is required");
  }
  await mongoose.connect(process.env.MONGO_URL);
  isConnected = true;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "MongoDB connection error" });
  }
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("LifeQuest API Running");
});

// IMPORTANT FOR VERCEL (do NOT call app.listen here)
module.exports = app;

