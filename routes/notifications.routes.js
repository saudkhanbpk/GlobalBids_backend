import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllMessagesAsRead
} from "../controller/notifications.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const notificationRouter = express.Router();

notificationRouter.get("", authMiddleware, getNotifications);
notificationRouter.get("/mark/all", authMiddleware, markAllMessagesAsRead);
notificationRouter.get("/mark/:id", authMiddleware, markNotificationAsRead);

export default notificationRouter;
