import express from "express";
import {
  contractorProfileController,
  getContractorProfileController,
} from "../controller/contractor.controller.js";
import upload from "../config/multer.config.js";
import authMiddleware from "../middleware/auth.middleware.js";

const contractorProfileRouter = express.Router();

contractorProfileRouter.post(
  "/profile",
  authMiddleware,
  upload.single("image"),
  contractorProfileController
);

contractorProfileRouter.get(
  "/profile",
  authMiddleware,
  getContractorProfileController
);

export default contractorProfileRouter;