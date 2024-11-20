import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllMessagesAsRead
} from "../controller/notifications.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const notificationRouter = express.Router();

notificationRouter.get("", authMiddleware, getNotifications);
notificationRouter.get("/messages/mark-as-read", authMiddleware, markAllMessagesAsRead);
notificationRouter.get("/:id", authMiddleware, markNotificationAsRead);

export default notificationRouter;
