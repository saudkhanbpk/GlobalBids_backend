import express from "express";
import {
  contractorSettings,
  deleteContractorServiceById,
  getContractorPage,
  getContractorSettings,
  updateContractorProfile,
} from "../controller/contractor.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const contractorRouter = express.Router();

contractorRouter.post("/settings", authMiddleware, contractorSettings);
contractorRouter.get("/settings", authMiddleware, getContractorSettings);
contractorRouter.post("/profile", authMiddleware, updateContractorProfile);
contractorRouter.delete(
  "/delete-page-services/:id",
  authMiddleware,
  deleteContractorServiceById
);
// this route is for homeowner to view contractor page
contractorRouter.get("/page/:id", authMiddleware, getContractorPage);

export default contractorRouter;
