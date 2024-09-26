import express from "express";
import {
  loginController,
  signUpController,
  otpController,
  resendOtpController,
  updateUserInfo,
  findUser,
  verifyUserAndResetPassword,
  resetPassword,
} from "../controller/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../config/multer.config.js";

const router = express.Router();

router.post("/signup", signUpController);
router.post("/login", loginController);
router.post("/otp", otpController);
router.post("/resend-otp", resendOtpController);
router.post(
  "/update-user-info",
  upload.single("image"),
  authMiddleware,
  updateUserInfo
);

router.post("/find-user", findUser);
router.post("/find-and-verify", verifyUserAndResetPassword);
router.post("/reset-password", resetPassword);

export default router;
