import express from "express";
import {
  getAllContractorProjects,
  getOwnerProjects,
  getProjectsInProgress,
} from "../controller/project.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const projectRouter = express.Router();

projectRouter.get("/owner", authMiddleware, getOwnerProjects);
projectRouter.get("/in-progress", authMiddleware, getProjectsInProgress);
projectRouter.get("/contractor/projects", authMiddleware, getAllContractorProjects)

export default projectRouter;
