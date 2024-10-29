import express from "express";
import {
  getAllContractorProjects,
  getOwnerProjects,
  getProjectsInProgress,
  updateProject,
} from "../controller/project.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../config/multer.config.js";

const projectRouter = express.Router();

projectRouter.get("/owner", authMiddleware, getOwnerProjects);
projectRouter.get("/in-progress", authMiddleware, getProjectsInProgress);
projectRouter.get(
  "/contractor",
  authMiddleware,
  getAllContractorProjects
);
projectRouter.post(
  "/:id",
  authMiddleware,
  upload.array("files", 7),
  updateProject
);

export default projectRouter;
