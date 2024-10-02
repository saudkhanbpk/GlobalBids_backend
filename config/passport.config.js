import passport from "passport";
import GoogleAuth from "passport-google-oauth20";
import dotenv from "dotenv";
import { getUserByEmail } from "../services/user.service.js";
import UserContractorModel from "../model/user.contractor.model.js";
import UserHomeOwnerModel from "../model/user.homeOwner.model.js";
dotenv.config();

passport.use(
  new GoogleAuth.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://globalbids-backend.onrender.com/auth/google/callback",
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async function (req, _accessToken, _refreshToken, profile, cb) {
      const userRole = req?.query?.state;
      const user = profile?._json;
      const provider = profile?.provider;

      try {
        const existUser = await getUserByEmail(user.email);

        if (existUser?.provider === "credentials") {
          req.res.redirect(
            `${process.env.REDIRECT_URL}/auth-redirect?error=400`
          );
          return;
        }

        if (existUser) {
          return cb(null, existUser);
        }

        const userData = {
          email: user.email,
          username: user.name,
          imageUrl: user.picture,
          googleId: user.sub,
          isVerified: true,
          role: userRole,
          provider,
        };

        let newUser = null;

        switch (userRole) {
          case "contractor":
            newUser = await new UserContractorModel(userData).save();
            break;
          case "owner":
            newUser = await new UserHomeOwnerModel(userData).save();
            break;
          default:
            req.res.redirect(
              `${process.env.REDIRECT_URL}/auth/login?error=404`
            );
            return;
        }
        return cb(null, newUser);
      } catch (error) {
        req.res.redirect(`${process.env.REDIRECT_URL}/auth-redirect?error=400`);
        return;
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

export default passport;
