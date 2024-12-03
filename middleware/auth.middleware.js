import jwt from "jsonwebtoken";
import { AuthenticationError } from "../error/AppError.js";
import dotenv from "dotenv";
import AccountModel from "../model/account.model.js";

dotenv.config();

const authMiddleware = async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(new AuthenticationError("no authentication token provided."));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await AccountModel.findById(decoded._id);

    if (!user) {
      throw new AuthenticationError("access denied!");
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError && err.message === "jwt expired") {
      return next(new AuthenticationError("Token has expired"));
    } else if (err instanceof jwt.JsonWebTokenError) {
      return next(new AuthenticationError("Token is not valid"));
    } else {
      return next(err);
    }
  }
};

export default authMiddleware;
