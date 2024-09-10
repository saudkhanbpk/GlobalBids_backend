import express from "express";
import { getSettings, settings } from "../controller/owner.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const ownerRoutes = express.Router();

ownerRoutes.post("/settings", authMiddleware, settings);
ownerRoutes.get("/settings", authMiddleware, getSettings);

export default ownerRoutes;
