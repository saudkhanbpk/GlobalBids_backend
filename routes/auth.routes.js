import express from "express";
import {
  loginController,
  signUpController,
  resendOtpController,
  updateUserInfo,
  findUser,
  verifyUserAndResetPassword,
  resetPassword,
  getUser,
  markUsersAsFirstTimeLogin,
  changePassword,
  verifyAccount,
  logout
} from "../controller/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", signUpController);
router.post("/login", loginController);
router.post("/otp/verify-account", verifyAccount);
router.post("/resend-otp", resendOtpController);
router.post("/update-user-info", authMiddleware, updateUserInfo);

router.post("/find-user", findUser);
router.post("/find-and-verify", verifyUserAndResetPassword);
router.post("/reset-password", resetPassword);
router.get("/login/success", authMiddleware, getUser);
router.get("/is-first-time-login", authMiddleware, markUsersAsFirstTimeLogin);
router.post("/change-password", authMiddleware, changePassword)
router.get("/logout", authMiddleware, logout)

export default router;
