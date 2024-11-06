import express from "express";
import {
  createJob,
  getAllJobs,
  getJobDetails,
  getUserJobs,
  getJobStatistics,
  getJob,
} from "../controller/jobs.controller.js";
import upload from "../config/multer.config.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/create", upload.array("files", 6), authMiddleware, createJob);

router.get("", authMiddleware, getAllJobs);

router.get("/get-user-jobs", authMiddleware, getUserJobs);
router.get("/job-details/:id", authMiddleware, getJobDetails);
router.get("/get-jobs-statistics", authMiddleware, getJobStatistics);
router.get("/:id", authMiddleware, getJob);

export default router;
