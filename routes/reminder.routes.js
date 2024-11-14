import express from "express";
import {
  getAllReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getReminder
} from "../controller/reminder.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const reminderRouter = express.Router();

reminderRouter.get("", authMiddleware, getAllReminders);

reminderRouter.post("/create", authMiddleware, createReminder);

reminderRouter.put("/:id", authMiddleware, updateReminder);

reminderRouter.delete("/:id", authMiddleware, deleteReminder);
reminderRouter.get("/:id", authMiddleware, getReminder);

export default reminderRouter;
