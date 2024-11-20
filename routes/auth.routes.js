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
  getUser,
  markUsersAsFirstTimeLogin,
  changePassword
} from "../controller/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", signUpController);
router.post("/login", loginController);
router.post("/otp", otpController);
router.post("/resend-otp", resendOtpController);
router.post("/update-user-info", authMiddleware, updateUserInfo);

router.post("/find-user", findUser);
router.post("/find-and-verify", verifyUserAndResetPassword);
router.post("/reset-password", resetPassword);
router.get("/login/success", authMiddleware, getUser);
router.get("/is-first-time-login", authMiddleware, markUsersAsFirstTimeLogin);
router.post("/change-password", authMiddleware, changePassword);

export default router;
