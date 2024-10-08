import express from "express";
import {
  createStory,
  getStoryFeeds,
  addComment,
  getStoryDetails,
  toggleLike,
  deleteComment
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
storyRouter.delete("/delete-comment/:id", authMiddleware, deleteComment);

export default storyRouter;
