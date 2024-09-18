import express from "express";
import { createEvent, getEvents } from "../controller/events.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const eventRouter = express.Router();

eventRouter.post("/create", authMiddleware, createEvent);
eventRouter.get("", authMiddleware, getEvents);

export default eventRouter;
