import express from "express";
import {
  getOwnerProjects,
  getOwnerCurrentProjects,
} from "../controller/project.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const projectRouter = express.Router();

projectRouter.get("/owner", authMiddleware, getOwnerProjects);
projectRouter.get("/owner/current", authMiddleware, getOwnerCurrentProjects);

export default projectRouter;
