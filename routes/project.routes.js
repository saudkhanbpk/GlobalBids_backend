import express from "express";
import { getOwnerProjects } from "../controller/project.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const projectRouter = express.Router();

projectRouter.get("/owner", authMiddleware, getOwnerProjects);

export default projectRouter;
