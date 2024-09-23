import express from "express";
import {
  createStory,
  getStoryFeeds,
  addComment,
  getStoryDetails,
  toggleLike,
} from "../controller/story.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../config/multer.config.js";
const storyRouter = express.Router();

storyRouter.post(
  "/create",
  authMiddleware,
  upload.array("files", 3),
  createStory
);

storyRouter.get("/feeds", getStoryFeeds);
storyRouter.post("/add-comment", authMiddleware, addComment);
storyRouter.get("/get-details/:id", authMiddleware, getStoryDetails);
storyRouter.get("/like/:id", authMiddleware, toggleLike);

export default storyRouter;
