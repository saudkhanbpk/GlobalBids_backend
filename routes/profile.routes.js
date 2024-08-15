import express from "express";
import { ProfileController } from "../controller/profile.controller.js";
import upload from "../config/mutler.config.js";
const router = express.Router();

router.post("/", upload.single("image"), ProfileController);

export default router;
