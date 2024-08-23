import express from "express";
import { createJobController } from "../controller/jobs.controller.js";
import upload from "../config/multer.config.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.post(
  "/create",
  upload.single("filename"),
  authMiddleware,
  createJobController
);

export default router;
