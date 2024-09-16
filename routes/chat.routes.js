import express from "express";
import {
  getAllMessages,
  getRooms,
  deleteRoom,
} from "../controller/chat.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.get("/messages", authMiddleware, getAllMessages);
chatRouter.get("/rooms", authMiddleware, getRooms);
chatRouter.delete("/room/:id", authMiddleware, deleteRoom);

export default chatRouter;
