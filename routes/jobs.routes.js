import express from "express";
import { createJob, getAllJobs, getAllContractorJobs } from "../controller/jobs.controller.js";
import upload from "../config/multer.config.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/create", upload.single("file"), authMiddleware, createJob);

router.get("", authMiddleware, getAllJobs);


export default router;
