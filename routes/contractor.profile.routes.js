import express from "express";
import { contractorProfileController } from "../controller/contractor.profile.controller.js";
import upload from "../config/multer.config.js";
import authMiddleware from "../middleware/auth.middleware.js";

const contractorProfileRouter = express.Router();

contractorProfileRouter.post(
  "/profile",
  authMiddleware,
  upload.single("image"),
  contractorProfileController
);

export default contractorProfileRouter;
