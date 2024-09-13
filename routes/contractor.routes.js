import express from "express";
import {
  contractorProfileController,
  contractorSettings,
  getContractorProfileController,
  getContractorSettings,
  getJobDetails,
} from "../controller/contractor.controller.js";
import upload from "../config/multer.config.js";
import authMiddleware from "../middleware/auth.middleware.js";

const contractorRouter = express.Router();

contractorRouter.post(
  "/profile",
  authMiddleware,
  upload.single("image"),
  contractorProfileController
);

contractorRouter.get(
  "/profile",
  authMiddleware,
  getContractorProfileController
);

contractorRouter.post("/settings", authMiddleware, contractorSettings);
contractorRouter.get("/settings", authMiddleware, getContractorSettings);
contractorRouter.get("/job-details/:id", authMiddleware, getJobDetails);

export default contractorRouter;
