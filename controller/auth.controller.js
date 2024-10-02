import {
  ValidationError,
  InternalServerError,
  LoginError,
  NotFoundError,
} from "../error/AppError.js";
import generateAuthToken from "../utils/generate-auth-token.js";
import {
  getUserByEmail,
  getUserById,
  updateContractorInfo,
  updateHomeownerInfo,
  updateUserVerificationStatus,
} from "../services/user.service.js";
import { signUpValidate } from "../validators/sign-up-validators.js";
import OtpModel from "../model/otp.model.js";
import { generateOtp } from "../utils/generate-otp.js";
import { sendEmail } from "../utils/send-emails.js";
import { otpMailOptions } from "../utils/mail-options.js";
import { sendOtpToUser } from "../services/otp.service.js";
import ResetPasswordModel from "../model/reset.password.js";
import UserContractorModel from "../model/user.contractor.model.js";
import UserHomeOwnerModel from "../model/user.homeOwner.model.js";
import crypto from "crypto";

export const signUpController = async (req, res, next) => {
  const userData = req.body;

  const validateData = signUpValidate(userData);
  if (validateData) {
    return next(new ValidationError());
  }

  try {
    const existingOwner = await UserHomeOwnerModel.findOne({
      email: userData.email,
    });
    const existingContractor = await UserContractorModel.findOne({
      email: userData.email,
    });

    if (existingOwner || existingContractor) {
      return next(new ValidationError("User with this email already exists"));
    }

    userData.provider = "credentials";
    let newUser;
    if (userData.role === "owner") {
      newUser = new UserHomeOwnerModel(userData);
    } else if (userData.role === "contractor") {
      newUser = new UserContractorModel(userData);
    } else {
      return next(new ValidationError("Invalid user role"));
    }

    newUser = await newUser.save();

    const otpResponse = await sendOtpToUser(newUser);

    return res.status(201).json({
      success: true,
      message: "Please verify your account",
      userId: newUser.id,
      otpId: otpResponse.otpId,
    });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const loginController = async (req, res, next) => {
  const { email, password } = req.body;

  
  if (!(email && password)) {
    return next(new ValidationError("Email and Password are Required"));
  }
  
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return next(new LoginError());
    }
    if (!user.isVerified) {
      const otpResponse = await sendOtpToUser(user);
      return res.status(200).json({
        success: true,
        user: { _id: user._id, isVerified: user.isVerified },
        otpId: otpResponse.otpId,
        message: "Please verify your account!",
      });
    }

    const passMatch = await user.comparePassword(password);
    if (!passMatch) {
      return next(new LoginError());
    }

    const token = await generateAuthToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    return res.status(200).json({ user, token, success: true });
  } catch (error) {
    console.log(error);
    return next(new InternalServerError());
  }
};

export const otpController = async (req, res, next) => {
  const { userId, otp, otpId } = req.body;
  console.log(userId);

  try {
    const user = await getUserById(userId);
    const userOtp = await OtpModel.findById(otpId);

    if (!userOtp) {
      return next(new ValidationError("Invalid Otp"));
    }

    if (userOtp.otp === otp) {
      await updateUserVerificationStatus(user._id);
      await OtpModel.deleteOne({ _id: otpId });
      return res.status(200).json({
        message: "Account verified successfully",
        success: true,
      });
    }

    return next(new ValidationError("Invalid Otp"));
  } catch (error) {
    console.log(error);

    return next(new InternalServerError());
  }
};

export const resendOtpController = async (req, res, next) => {
  try {
    const { otpId, userId, userRole } = req.body;
    const userType = userRole === "owner" ? "Homeowner" : "Contractor";

    let otpRecord;

    if (otpId) {
      otpRecord = await OtpModel.findById(otpId).populate({
        path: "userId",
        select: "email",
      });

      if (otpRecord) {
        if (otpRecord.count >= 3) {
          return res.status(400).json({
            success: false,
            message: "You can't request OTP more than 3 times.",
          });
        }

        otpRecord.otp = generateOtp();
        otpRecord.count += 1;
        await otpRecord.save();

        const mailOpt = otpMailOptions(otpRecord.otp, otpRecord.userId.email);
        await sendEmail(mailOpt);

        return res.status(200).json({
          success: true,
          message: "OTP resent successfully.",
        });
      }
    }

    const user = await getUserById(userId);
    const newOtp = generateOtp();
    otpRecord = new OtpModel({
      otp: newOtp,
      userId,
      userType,
      count: 1,
    });
    await otpRecord.save();

    const mailOpt = otpMailOptions(newOtp, user.email);
    await sendEmail(mailOpt);

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email",
      otpId: otpRecord._id,
    });
  } catch (error) {
    console.log(error);

    return next(new InternalServerError("Failed to resend OTP!"));
  }
};

export const updateUserInfo = async (req, res, next) => {
  const user = req.user;
  try {
    let updatedUser = null;

    switch (user.role) {
      case "owner":
        updatedUser = await updateHomeownerInfo(user._id, req.body, req.file);
        break;
      case "contractor":
        updatedUser = await updateContractorInfo(user._id, req.body, req.file);
        break;
      default:
        return next(new Error("Invalid user role"));
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: "User info updated successfully!",
    });
  } catch (error) {
    console.log(error);
    const serverError = new InternalServerError(
      "An error occurred while updating user information"
    );
    return next(serverError);
  }
};

export const findUser = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ValidationError("email is required"));
  }
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "user not found!" });
    }
    const otpResponse = await sendOtpToUser(user);
    return res.status(201).json({
      success: true,
      otpId: otpResponse.otpId,
      user: { _id: user._id },
      message: "Opt has been send to your email",
    });
  } catch (error) {
    console.log(error);
    return next(new InternalServerError("can't find user"));
  }
};

export const verifyUserAndResetPassword = async (req, res, next) => {
  const { userId, otp } = req.body;

  try {
    const otpDoc = await OtpModel.findOne({ userId });
    if (!otpDoc) {
      return next(new NotFoundError("invalid credentials"));
    }
    if (otp !== otpDoc.otp) {
      return next(new ValidationError("invalid otp"));
    }

    await ResetPasswordModel.findOneAndDelete({ userId });

    const reset = new ResetPasswordModel({
      userId: userId,
      token: crypto.randomBytes(10).toString("hex"),
    });
    await reset.save();
    return res.status(200).json({ success: true, token: reset.token });
  } catch (error) {
    console.log(error);

    return next(new InternalServerError("can't verify otp"));
  }
};

export const resetPassword = async (req, res, next) => {
  const { password, token, userId } = req.body;

  try {
    const savedToken = await ResetPasswordModel.findOne({ userId });
    if (savedToken.token !== token) {
      return next(new ValidationError("some thing went wrong!"));
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new NotFoundError("User not found"));
    }
    user.password = password;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return next(new InternalServerError("Failed to update password"));
  }
};

export const getUser = async (req, res, next) => {
  const userId = req.user;
  try {
    const user = await getUserById(userId);
    return res.status(200).json({ user, success: true });
  } catch (error) {
    return next(new InternalServerError());
  }
};
