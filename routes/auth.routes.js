import express from "express";
import {
  loginController,
  signUpController,
  otpController,
  resendOtp,
  updateUserInfo,
} from "../controller/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../config/multer.config.js";

const router = express.Router();

router.post("/signup", signUpController);
router.post("/login", loginController);
router.post("/otp", otpController);
router.post("/resend-otp", resendOtp);
router.post(
  "/update-user-info",
  upload.single("image"),
  authMiddleware,
  updateUserInfo
);

export default router;
