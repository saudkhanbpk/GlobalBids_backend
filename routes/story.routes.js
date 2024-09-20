import express from "express";
import { createStory } from "../controller/story.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../config/multer.config.js";
const storyRouter = express.Router();

storyRouter.post(
  "/create",
  authMiddleware,
  upload.array("files", 3),
  createStory
);

export default storyRouter;
