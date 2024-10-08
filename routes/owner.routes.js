import express from "express";
import {
  getSettings,
  settings,
  getContractors,
  getHomeMaintenanceReminders,
} from "../controller/owner.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const ownerRoutes = express.Router();

ownerRoutes.post("/settings", authMiddleware, settings);
ownerRoutes.get("/settings", authMiddleware, getSettings);
ownerRoutes.get("/contractors", authMiddleware, getContractors);
ownerRoutes.get(
  "/home-maintenance-reminder",
  authMiddleware,
  getHomeMaintenanceReminders
);

export default ownerRoutes;
