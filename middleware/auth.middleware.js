import jwt from "jsonwebtoken";
import UserModel from "../model/user.model.js";
import { AuthenticationError } from "../error/AppError.js";
import dotenv from "dotenv";
dotenv.config();

const authMiddleware = async (req, _res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return next(
      new AuthenticationError("access denied")
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      throw new AuthenticationError("User not found");
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
