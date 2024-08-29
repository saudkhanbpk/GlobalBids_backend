import express from "express";
import {
  loginController,
  signUpController,
  otpController
} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signUpController);
router.post("/login", loginController);
router.post("/otp", otpController)

export default router;
