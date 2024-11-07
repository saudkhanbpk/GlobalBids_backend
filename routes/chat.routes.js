import express from "express";
import {
  getAllMessages,
  getRooms,
  deleteRoom,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessages,
  getRoom,
  recentInteractions
} from "../controller/chat.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.post("/room", authMiddleware, getAllMessages);
chatRouter.get("/rooms", authMiddleware, getRooms);
chatRouter.delete("/room/:id", authMiddleware, deleteRoom);
chatRouter.post("/send-message", authMiddleware, sendMessage);
chatRouter.post("/mark-messages-as-read", authMiddleware, markMessagesAsRead);
chatRouter.get("/messages-notification", authMiddleware, getUnreadMessages);
chatRouter.get("/room/:id", authMiddleware, getRoom);
chatRouter.get("/recent-interactions", authMiddleware, recentInteractions);

export default chatRouter;
