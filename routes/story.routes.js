import express from "express";
import { createStory } from "../controller/story.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const storyRouter = express.Router();

storyRouter.get("/", authMiddleware, createStory);

export default storyRouter;
