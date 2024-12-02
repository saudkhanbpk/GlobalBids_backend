import passport from "passport";
import GoogleAuth from "passport-google-oauth20";
import AccountModel from "../model/account.model.js";

passport.use(
  new GoogleAuth.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.AUTH_REDIRECT_URL}/auth/google/callback`,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async function (req, _accessToken, _refreshToken, profile, cb) {
      const userRole = req?.query?.state;
      const user = profile?._json;
      const provider = profile?.provider;

      try {
        const existUser = await AccountModel.findOne({ email: user.email });

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
          avatarUrl: user.picture,
          googleId: user.sub,
          isVerified: true,
          role: userRole,
          provider,

          isFirstLogin: true,
        };

        const newUser = new AccountModel(userData);
        await newUser.save();

        if (!userRole) {
          req.res.redirect(`${process.env.REDIRECT_URL}/auth/login?error=404`);
          return;
        }
        return cb(null, newUser);
      } catch (error) {
        console.log(error);

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
