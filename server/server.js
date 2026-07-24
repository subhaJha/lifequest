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
const progressRoutes = require("./routes/progressRoutes.js");
const characterRoutes = require("./routes/characterRoutes.js");
const kingdomRoutes = require("./routes/kingdomRoutes.js");
const districtRoutes = require("./routes/districtRoutes.js");
const buildingRoutes = require("./routes/buildingRoutes.js");
const battleRoutes = require("./routes/battleRoutes.js");


const app = express();



// MIDDLEWARE
app.use((req, res, next) => {
  // Controls how much Referrer information browsers send for cross-origin requests
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// CORS: allow frontend + Vercel preview domains
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests
      if (!origin) return callback(null, true);

      // Allow local dev
      if (origin === "http://localhost:5173") return callback(null, true);

      // Allow all Vercel preview domains for this app: https://lifequest-*.vercel.app
      if (/^https:\/\/lifequest-[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
        return callback(null, true);
      }

      // Reject everything else
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
app.use("/api/progress", progressRoutes);
app.use("/api/character", characterRoutes);
app.use("/api/kingdom", kingdomRoutes);
app.use("/api/district", districtRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/battles", battleRoutes);

app.get("/", (req, res) => {


  res.send("LifeQuest API Running");
});


// IMPORTANT FOR VERCEL (do NOT call app.listen here)

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
