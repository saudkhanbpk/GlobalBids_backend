import express from "express";
import {
  createEvent,
  getEvents,
  deleteEvent,
  updateEvent,
} from "../controller/events.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const eventRouter = express.Router();

eventRouter.post("/create", authMiddleware, createEvent);
eventRouter.get("", authMiddleware, getEvents);
eventRouter.delete("/:id", authMiddleware, deleteEvent);
eventRouter.put("/:id", authMiddleware, updateEvent);

export default eventRouter;
