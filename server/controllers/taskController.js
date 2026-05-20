const Task = require("../models/Task");
const User = require("../models/User");
const { addXP } = require("../utils/xp");

// CREATE TASK
const createTask = async (req, res) => {
  try {
    const { title, description, category, xpReward, priority } = req.body;

    if (!title || !xpReward) {
      return res
        .status(400)
        .json({ msg: "Title and xpReward are required" });
    }

    const task = new Task({
      userId: req.user.id,
      title,
      description,
      category,
      xpReward,
      priority,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL TASKS FOR USER
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// COMPLETE TASK
const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Check ownership
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // If already completed, don't award XP again
    if (task.completed) {
      return res.status(400).json({ msg: "Task already completed" });
    }

    // Mark complete
    task.completed = true;
    task.completedAt = new Date();
    await task.save();

    // Add XP to user
    const user = await User.findById(req.user.id);
    const xpResult = await addXP(user, task.xpReward);
    await user.save();

    res.json({
      task,
      xpResult,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE TASK
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Check ownership
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ msg: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  completeTask,
  deleteTask,
};
