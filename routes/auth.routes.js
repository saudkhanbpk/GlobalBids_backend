import express from "express";
import {
  loginController,
  signUpController,
  otpController,
  resendOtp
} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signUpController);
router.post("/login", loginController);
router.post("/otp", otpController)
router.post("/resend-otp", resendOtp)

export default router;
