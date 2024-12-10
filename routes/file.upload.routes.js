import express from "express";
import upload from "../config/multer.config.js";
import {
  uploadAvatar,
  uploadContractorDocumentsController,
  uploadCoverPhoto,
  uploadPageMedia,
} from "../controller/file.upload.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const fileUploadRouter = express.Router();

fileUploadRouter.post(
  "/avatar",
  upload.single("file"),
  authMiddleware,
  uploadAvatar
);

fileUploadRouter.post(
  "/cover-photo",
  authMiddleware,
  upload.single("file"),
  uploadCoverPhoto
);

fileUploadRouter.post(
  "/contractor-documents",
  authMiddleware,
  upload.fields([
    { name: "insuranceFile", maxCount: 1 },
    { name: "compensationFile", maxCount: 1 },
  ]),
  uploadContractorDocumentsController
);

fileUploadRouter.post(
  "/contractor-portfolio-media",
  authMiddleware,
  upload.array("files", 10),
  uploadPageMedia
);

export default fileUploadRouter;
