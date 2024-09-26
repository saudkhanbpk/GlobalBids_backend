import jwt from "jsonwebtoken";
import { AuthenticationError } from "../error/AppError.js";
import dotenv from "dotenv";
import UserHomeOwnerModel from "../model/user.homeOwner.model.js";
import UserContractorModel from "../model/user.contractor.model.js";
dotenv.config();

const authMiddleware = async (req, _res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return next(new AuthenticationError("access denied"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = null;

    switch (decoded.role) {
      case "owner":
        user = await UserHomeOwnerModel.findById(decoded.id).select(
          "-password"
        );
        break;
      case "contractor":
        user = await UserContractorModel.findById(decoded.id).select(
          "-password"
        );
        break;
      default:
        user = null;
        break;
    }

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
