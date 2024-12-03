import {
  ValidationError,
  InternalServerError,
  LoginError,
  NotFoundError,
} from "../error/AppError.js";
import {
  getUserByEmail,
  getUserById,
  updateContractorInfo,
  updateHomeownerInfo,
} from "../services/user.service.js";
import { signUpValidate } from "../validators/sign-up-validators.js";
import OtpModel from "../model/otp.model.js";
import { generateOtp } from "../utils/generate-otp.js";
import { sendEmail } from "../utils/send-emails.js";
import { otpMailOptions } from "../utils/mail-options.js";
import { sendOtpToUser } from "../services/otp.service.js";
import ResetPasswordModel from "../model/reset.password.js";
import crypto from "crypto";
import AccountModel from "../model/account.model.js";
import { defaultCookiesOptions } from "../constants/cookies.options.js";

export const signUpController = async (req, res, next) => {
  const userData = req.body;

  const validateData = signUpValidate(userData);
  if (validateData) {
    return next(new ValidationError());
  }

  try {
    const existingUser = await AccountModel.findOne({
      email: userData.email,
    });

    if (existingUser) {
      return next(new ValidationError("User with this email already exists"));
    }

    userData.provider = "credentials";
    userData.isFirstLogin = true;

    const newUser = new AccountModel(userData);
    await newUser.save();

    const otpExpiry = Date.now() + 5 * 60 * 1000;
    const otpEntry = new OtpModel({
      otp: generateOtp(),
      accountId: newUser._id,
      otpType: "verify-account",
      expiresAt: otpExpiry,
    });
    otpEntry.save();
    const mailOpt = otpMailOptions(otpEntry.otp, newUser.email);
    await sendEmail(mailOpt);

    return res.status(201).json({
      success: true,
      message: "Please verify your account",
      userId: newUser.id,
      otpId: otpEntry.id,
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
    const user = await AccountModel.findOne({ email }).select("+password");

    if (!user) {
      return next(new LoginError());
    }

    if (!user.isVerified) {
      const otpExpiry = Date.now() + 5 * 60 * 1000;
      const otpEntry = new OtpModel({
        otp: generateOtp(),
        accountId: user._id,
        otpType: "verify-account",
        expiresAt: otpExpiry,
      });
      otpEntry.save();

      const mailOpt = otpMailOptions(otpEntry.otp, user.email);
      await sendEmail(mailOpt);
      return res.status(200).json({
        success: true,
        user: { _id: user._id, isVerified: user.isVerified },
        otpId: otpEntry._id,
        message: "Please verify your account!",
      });
    }

    const passMatch = await user.comparePassword(password);
    if (!passMatch) {
      return next(new LoginError());
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    return res
      .status(200)
      .cookie("accessToken", accessToken, defaultCookiesOptions)
      .cookie("refreshToken", refreshToken, defaultCookiesOptions)
      .json({ user, accessToken, refreshToken, success: true });
  } catch (error) {
    console.log(error);
    return next(new InternalServerError());
  }
};

export const verifyAccount = async (req, res, next) => {
  const { userId, otp, otpId } = req.body;

  try {
    const otpEntry = await OtpModel.findOne({
      _id: otpId,
      accountId: userId,
      otpType: "verify-account",
      otp: Number(otp),
      expiresAt: { $gte: new Date() },
    });

    if (!otpEntry) {
      return next(new ValidationError("Invalid Otp or Expired"));
    }

    const user = await AccountModel.findByIdAndUpdate(userId, {
      isVerified: true,
    });
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    return res.status(200).json({
      success: true,
      user,
      accessToken,
      refreshToken,
      message: "Account verified successfully",
    });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const resendOtpController = async (req, res, next) => {
  try {
    const userId = req.body.id;
    const now = new Date();
    const otpType = req.query.type;

    const user = await AccountModel.findById(userId);
    if (!user) {
      return next(new ValidationError("Invalid Request"));
    }

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const otpRequests = await OtpModel.find({
      accountId: userId,
      otpType,
      createdAt: { $gte: oneHourAgo },
    });

    if (otpRequests.length >= 3) {
      return next(
        new ValidationError(
          "You have reached the maximum number of OTP requests. Please try again later."
        )
      );
    }

    const activeOtp = await OtpModel.findOne({
      accountId: userId,
      otpType,
      expiresAt: { $gte: now },
    });

    if (activeOtp) {
      return next(
        new ValidationError(
          "An active OTP already exists. Please wait until it expires."
        )
      );
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const otpEntry = new OtpModel({
      accountId: userId,
      otp,
      otpType,
      expiresAt: otpExpiresAt,
    });
    await otpEntry.save();

    const mailOpt = otpMailOptions(otp, req.body.email);
    await sendEmail(mailOpt);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otpId: otpEntry._id,
    });
  } catch (error) {
    return next(new InternalServerError("Failed to resend OTP!"));
  }
};

export const updateUserInfo = async (req, res, next) => {
  const user = req.user;
  try {
    let updatedUser = null;

    switch (user.role) {
      case "owner":
        updatedUser = await updateHomeownerInfo(user._id, req.body);
        break;
      case "contractor":
        updatedUser = await updateContractorInfo(user._id, req.body);
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

    return next(
      new InternalServerError(
        "An error occurred while updating user information"
      )
    );
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
    const user = await AccountModel.findById(userId).populate({
      path: "profile",
    });
    return res.status(200).json({ user, success: true });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const markUsersAsFirstTimeLogin = async (req, res, next) => {
  const { _id } = req.user._id;
  try {
    const user = await AccountModel.findByIdAndUpdate(_id, {
      isFirstLogin: true,
    });
    if (!user) {
      return next(new NotFoundError("User not found"));
    }
    user.isFirstLogin = false;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "User marked as first time login" });
  } catch (error) {
    console.error("Error updating password:", error);
    return next(new InternalServerError("Failed to update user status"));
  }
};

export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const userId = req.user._id;
  try {
    const user = await getUserById(userId, "+password");

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    if (user.provider === "google") {
      return next(new ValidationError("You can't change password"));
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return next(new ValidationError("Invalid current password"));
    }

    if (newPassword !== confirmNewPassword) {
      return next(new ValidationError("Passwords do not match"));
    }

    user.password = newPassword;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return next(new InternalServerError("Failed to update password"));
  }
};

export const logout = async (req, res, next) => {
  // const userId = req.user._id;
  try {
    return res
      .status(200)
      .clearCookie("accessToken", defaultCookiesOptions)
      .clearCookie("refreshToken", defaultCookiesOptions)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    return next(new InternalServerError("Logout failed"));
  }
};
