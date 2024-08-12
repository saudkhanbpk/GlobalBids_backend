import express from "express";
import { emailCheckController, loginController } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/login", loginController);
router.post("/email-check", emailCheckController );

export default router;
