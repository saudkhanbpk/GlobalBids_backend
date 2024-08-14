import express from "express";
import { ProfileController } from "../controller/profile.controller.js";
const router = express.Router();

router.post("/", ProfileController);

export default router;
