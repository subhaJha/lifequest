const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const taskRoutes = require("../routes/taskRoutes");

const app = express();


// MIDDLEWARE
app.use(
  cors({
    origin: "https://lifequest-z383.vercel.app",
    credentials: true,
  })
);

app.use(express.json());


// DATABASE CONNECTION
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);


app.get("/", (req, res) => {
  res.send("LifeQuest API Running");
});


// IMPORTANT FOR VERCEL
module.exports = app;