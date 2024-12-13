import express from "express";
import {
  createJob,
  getAllJobs,
  getJobDetails,
  getHomeownerJobs,
  getJobStatistics,
  getJob,
  getContractorJobs,
  editJob,
  deleteJob,
  repostJob,
  inviteContractorToJob,
  findJobs
} from "../controller/jobs.controller.js";
import upload from "../config/multer.config.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/create", upload.array("files", 6), authMiddleware, createJob);
router.get("/homeowner", authMiddleware, getHomeownerJobs);
router.get("/job-details/:id", authMiddleware, getJobDetails);
router.get("/get-jobs-statistics", authMiddleware, getJobStatistics);
router.get("/contractor", authMiddleware, getContractorJobs);
router.put("/edit/:id", authMiddleware, upload.array("files", 6), editJob);
router.get("/re-post/:id", authMiddleware, repostJob);
router.delete("/delete/:id", authMiddleware, deleteJob);
router.post("/invite/:id", authMiddleware, inviteContractorToJob);
router.get("/", authMiddleware, getAllJobs);
router.get("/find", authMiddleware, findJobs);
router.get("/:id", authMiddleware, getJob);

export default router;
