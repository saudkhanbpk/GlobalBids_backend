import jwt from "jsonwebtoken";
import UserModel from "../model/user.model.js";
import { AuthenticationError } from "../error/AppError.js";
import dotenv from "dotenv";
dotenv.config();

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new AuthenticationError("No token provided, authorization denied");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError && err.message === "jwt expired") {
      next(new AuthenticationError("Token has expired"));
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError("Token is not valid"));
    } else {
      next(err);
    }
  }
};

export default authMiddleware;
