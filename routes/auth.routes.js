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
} from "../controller/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../config/multer.config.js";

const router = express.Router();

router.post("/register", signUpController);
router.post("/login", loginController);
router.post("/otp", otpController);
router.post("/resend-otp", resendOtpController);
router.post(
  "/update-user-info",
  upload.fields([
    { name: "insuranceFile", maxCount: 1 },
    { name: "profilePic", maxCount: 1 },
    { name: "compensationFile", maxCount: 1 },
  ]),
  authMiddleware,
  updateUserInfo
);

router.post("/find-user", findUser);
router.post("/find-and-verify", verifyUserAndResetPassword);
router.post("/reset-password", resetPassword);
router.get("/login/success", authMiddleware, getUser);

export default router;
