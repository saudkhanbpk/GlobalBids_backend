import express from "express";
import passport from "../config/passport.config.js";
import { InternalServerError } from "../error/AppError.js";
import { defaultCookiesOptions } from "../constants/cookies.options.js";

const router = express.Router();

router.get("/auth/google", (req, res, next) => {
  const role = req.query.role;
  if (!role) {
    return next(new InternalServerError("Invalid OAuth"));
  }
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: role,
  })(req, res, next);
});

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  async (req, res) => {
    const user = req.user;
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    res
      .cookie("accessToken", accessToken, defaultCookiesOptions)
      .cookie("refreshToken", refreshToken, defaultCookiesOptions)
      .redirect(
        `${process.env.REDIRECT_URL}/auth-redirect?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
  }
);

export default router;
