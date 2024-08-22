import express from "express";
import {
  createProfileController,
  getProfileController,
} from "../controller/profile.controller.js";
import upload from "../config/mutler.config.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.post(
  "/",
  upload.single("image"),
  authMiddleware,
  createProfileController
);
router.get("/", authMiddleware, getProfileController);

export default router;
