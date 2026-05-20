const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  completeTask,
  deleteTask,
} = require("../controllers/taskController");

// CREATE TASK
router.post("/", auth, createTask);

// GET USER TASKS
router.get("/", auth, getTasks);

// COMPLETE TASK
router.put("/:taskId/complete", auth, completeTask);

// DELETE TASK
router.delete("/:taskId", auth, deleteTask);

module.exports = router;
