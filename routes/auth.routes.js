import express from "express";
import {
  emailCheckController,
//   loginController,
  signUpController,
} from "../controller/auth.controller.js";

const router = express.Router();

// router.post("/login", loginController);
router.post("/email-check", emailCheckController);
router.post("/signup", signUpController);

export default router;
