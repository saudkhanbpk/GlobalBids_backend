import express from "express";
import { createJob, getAllJobs, getJobDetails, getOwnerJobs } from "../controller/jobs.controller.js";
import upload from "../config/multer.config.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/create", upload.single("file"), authMiddleware, createJob);

router.get("", authMiddleware, getAllJobs);

router.get("/get-owner-jobs", authMiddleware, getOwnerJobs)
router.get("/job-details/:id", authMiddleware, getJobDetails);



export default router;
