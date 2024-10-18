import express from "express";
import passport from "../config/passport.config.js";
import { InternalServerError } from "../error/AppError.js";
import generateAuthToken from "../utils/generate-auth-token.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getUser } from "../controller/auth.controller.js";

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
    const token = await generateAuthToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
 
    res.redirect(`${process.env.REDIRECT_URL}/auth-redirect?token=${token}`);
  }
);

router.get("/api/auth/login/success", authMiddleware, getUser);

export default router;
