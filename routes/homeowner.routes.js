import express from "express";
import {
  getSettings,
  settings,
  getContractors,
  getHomeMaintenanceReminders,
  updateHomeownerProfile
} from "../controller/homeowner.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const homeownerRoutes = express.Router();

homeownerRoutes.post("/settings", authMiddleware, settings);
homeownerRoutes.get("/settings", authMiddleware, getSettings);
homeownerRoutes.get("/find-contractors", authMiddleware, getContractors);
homeownerRoutes.get(
  "/home-maintenance-reminder",
  authMiddleware,
  getHomeMaintenanceReminders
);

homeownerRoutes.post("/profile", authMiddleware, updateHomeownerProfile);

export default homeownerRoutes;
