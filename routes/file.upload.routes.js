import express from "express";
import upload from "../config/multer.config.js";
import { uploadAvatar } from "../controller/file.upload.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const fileUploadRouter = express.Router();

fileUploadRouter.post(
  "/avatar",
  upload.single("file"),
  authMiddleware,
  uploadAvatar
);

export default fileUploadRouter;
