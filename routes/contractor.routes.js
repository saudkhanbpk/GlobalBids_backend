import express from "express";
import {
  contractorSettings,
  getContractorSettings,
  getJobDetails,
} from "../controller/contractor.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const contractorRouter = express.Router();

contractorRouter.post("/settings", authMiddleware, contractorSettings);
contractorRouter.get("/settings", authMiddleware, getContractorSettings);
contractorRouter.get("/job-details/:id", authMiddleware, getJobDetails);

export default contractorRouter;
