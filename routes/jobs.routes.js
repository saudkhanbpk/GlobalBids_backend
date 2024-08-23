import express from "express";
import { createJobController } from "../controller/jobs.controller.js";
import upload from "../config/multer.config.js";
const router = express.Router();

router.post("/create", upload.single("filename"),createJobController);

export default router;
