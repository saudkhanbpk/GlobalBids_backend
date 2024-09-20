import UserModel from "../model/user.model.js";
import {
  ValidationError,
  InternalServerError,
  LoginError,
  NotFoundError,
} from "../error/AppError.js";
import generateAuthToken from "../utils/generte-auth-token.js";
import { getUserByEmail, getUserById } from "../services/user.service.js";
import { signUpValidate } from "../validators/sign-up-validators.js";
import OtpModel from "../model/otp.model.js";
import { generateOtp } from "../utils/generate-otp.js";
import { sendEmail } from "../utils/send-emails.js";
import { otpMailOptions } from "../utils/mail-options.js";
import { uploadProfileImage } from "../services/upload.image.service.js";
import { sendOtpToUser } from "../services/otp.service.js";
import ResetPasswordModel from "../model/reset.password.js";
import crypto from "crypto";

export const signUpController = async (req, res, next) => {
  const userData = req.body;

  const validateData = signUpValidate(userData);

  if (validateData) {
    return next(new ValidationError(JSON.stringify(validateData)));
  }

  try {
    const user = new UserModel(userData);
    const newUser = await user.save();
    const otpResponse = await sendOtpToUser(newUser);

    return res.status(201).json({
      success: true,
      message: "Please verify your account",
      user: newUser,
      otpId: otpResponse.otpId,
    });
  } catch (error) {
    if (error?.errorResponse?.code === 11000) {
      return next(new ValidationError("User already exist"));
    }
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

    const token = await generateAuthToken({ id: user._id, email: user.email });
    return res.status(200).json({ user, token, success: true });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const otpController = async (req, res, next) => {
  const { userId, otp, otpId } = req.body;
  try {
    const user = await UserModel.findById(userId);
    const userOtp = await OtpModel.findById(otpId);

    if (!userOtp) {
      return next(new ValidationError("Invalid Otp"));
    }

    if (userOtp?.otp === otp) {
      user.isVerified = true;
      await user.save();
      return res
        .status(200)
        .json({ message: "Account verified successfully", success: true });
    }
    return next(new ValidationError("Invalid Otp"));
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { otpId, userId } = req.body;

    let oldOtp;
    if (otpId) {
      oldOtp = await OtpModel.findById(otpId).populate({
        path: "userId",
        select: "email",
      });
    }

    if (oldOtp) {
      if (oldOtp.count >= 3) {
        return res.status(400).json({
          success: false,
          message: "You can't request OTP more than 3 times in an hour.",
        });
      }

      const newOtp = generateOtp();
      oldOtp.otp = newOtp;
      oldOtp.count += 1;
      await oldOtp.save();

      const mailOpt = otpMailOptions(newOtp, oldOtp.userId.email);
      await sendEmail(mailOpt);

      return res.status(200).json({
        success: true,
        message: "OTP resent successfully.",
      });
    }

    const user = await getUserById(userId);

    const newOtp = generateOtp();
    const newOtpEntry = new OtpModel({
      otp: newOtp,
      userId: userId,
      count: 1,
    });
    await newOtpEntry.save();

    const mailOpt = otpMailOptions(newOtp, user.email);
    await sendEmail(mailOpt);

    return res.status(201).json({
      success: true,
      message: "Otp sent to your email",
      otpId: newOtpEntry._id,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Failed to resend OTP." });
  }
};

export const updateUserInfo = async (req, res, next) => {
  const { fullName, address, phone, password } = req.body;
  const userId = req.user._id;
  const file = req.file;
  try {
    let imageUrl = "";
    if (file) {
      imageUrl = await uploadProfileImage(file);
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    user.fullName = fullName || user.fullName;
    user.address = address || user.address;
    user.phone = phone || user.phone;

    if (password) {
      user.password = password;
    }

    if (imageUrl) {
      user.imageUrl = imageUrl;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user,
      message: "user info updated successfully!",
    });
  } catch (error) {
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
