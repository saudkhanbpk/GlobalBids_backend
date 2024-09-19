import express from "express";
import {
  getAllMessages,
  getRooms,
  deleteRoom,
  getCurrentUser,
  sendMessage,
  getNewRoomData,
  markMessagesAsRead,
} from "../controller/chat.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.post("/room", authMiddleware, getAllMessages);
chatRouter.get("/rooms", authMiddleware, getRooms);
chatRouter.delete("/room/:id", authMiddleware, deleteRoom);
chatRouter.post("/get-user", authMiddleware, getCurrentUser);
chatRouter.post("/send-message", authMiddleware, sendMessage);
chatRouter.post("/mark-messages-as-read", authMiddleware, markMessagesAsRead);
chatRouter.post("/new-room/:id", authMiddleware, getNewRoomData);

export default chatRouter;
