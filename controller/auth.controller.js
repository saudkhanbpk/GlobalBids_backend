import {
  ValidationError,
  LoginError,
  NotFoundError,
  AuthenticationError,
} from "../error/AppError.js";
import { signUpValidate } from "../validators/sign-up-validators.js";
import OtpModel from "../model/otp.model.js";
import { generateOtp } from "../utils/generate-otp.js";
import { sendEmail } from "../utils/send-emails.js";
import { otpMailOptions } from "../utils/mail-options.js";
import ResetPasswordModel from "../model/reset.password.js";
import crypto from "crypto";
import AccountModel from "../model/account.model.js";
import { defaultCookiesOptions } from "../constants/cookies.options.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

export const signUpController = asyncHandler(async (req, res) => {
  const userData = req.body;

  const validateData = signUpValidate(userData);
  if (validateData) {
    throw new ValidationError();
  }

  const existingUser = await AccountModel.findOne({
    email: userData.email,
  });

  if (existingUser) {
    throw new ValidationError("User with this email already exists");
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
});

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    throw new ValidationError("Email and Password are Required");
  }

  const user = await AccountModel.findOne({ email }).select("+password");

  if (!user) {
    throw new LoginError();
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
      userId: user._id,
      isVerified: user.isVerified,
      otpId: otpEntry._id,
      message: "Please verify your account!",
    });
  }

  const passMatch = await user.comparePassword(password);
  if (!passMatch) {
    throw new LoginError();
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();
  return res
    .status(200)
    .cookie("accessToken", accessToken, defaultCookiesOptions)
    .cookie("refreshToken", refreshToken, defaultCookiesOptions)
    .json({ user, accessToken, refreshToken, success: true });
});

export const verifyAccount = asyncHandler(async (req, res) => {
  const { userId, otp, otpId } = req.body;

  const otpEntry = await OtpModel.findOne({
    _id: otpId,
    accountId: userId,
    otpType: "verify-account",
    otp: Number(otp),
    expiresAt: { $gte: new Date() },
  });

  if (!otpEntry) {
    throw new ValidationError("Invalid Otp or Expired");
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
});

export const resendOtpController = async (req, res) => {
  const userId = req.body.id;
  const now = new Date();
  const otpType = req.query.type;

  const user = await AccountModel.findById(userId);
  if (!user) {
    throw new ValidationError("Invalid Request");
  }

  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const otpRequests = await OtpModel.find({
    accountId: userId,
    otpType,
    createdAt: { $gte: oneHourAgo },
  });

  if (otpRequests.length >= 3) {
    throw new ValidationError(
      "You have reached the maximum number of OTP requests. Please try again later."
    );
  }

  const activeOtp = await OtpModel.findOne({
    accountId: userId,
    otpType,
    expiresAt: { $gte: now },
  });

  if (activeOtp) {
    throw new ValidationError(
      "An active OTP already exists. Please wait until it expires."
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

  const mailOpt = otpMailOptions(otp, user.email);
  await sendEmail(mailOpt);

  return res.status(200).json({
    success: true,
    message: "OTP sent successfully",
    otpId: otpEntry._id,
  });
};

export const findUser = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ValidationError("email is required");
  }

  const user = await AccountModel.findOne({ email });
  if (!user) {
    return res.status(200).json({ success: false, message: "user not found!" });
  }

  const otpExpiry = Date.now() + 5 * 60 * 1000;
  const otpEntry = new OtpModel({
    otp: generateOtp(),
    accountId: user._id,
    otpType: "forgot-password",
    expiresAt: otpExpiry,
  });
  otpEntry.save();
  const mailOpt = otpMailOptions(otpEntry.otp, user.email);
  await sendEmail(mailOpt);

  return res.status(201).json({
    success: true,
    otpId: otpEntry._id,
    userId: user._id,
    message: "Opt has been send to your email",
  });
};

export const verifyUserAndResetPassword = async (req, res) => {
  const { userId, otp, otpId } = req.body;

  const otpDoc = await OtpModel.findOne({
    accountId: userId,
    _id: otpId,
    otpType: "forgot-password",
    isVerified: false,
    otp: Number(otp),
    expiresAt: { $gte: new Date() },
  });

  if (!otpDoc) {
    throw new ValidationError("invalid otp or expired");
  }

  await ResetPasswordModel.findOneAndDelete({ accountId: userId });

  const reset = new ResetPasswordModel({
    accountId: userId,
    token: crypto.randomBytes(10).toString("hex"),
  });
  await reset.save();
  return res.status(200).json({ success: true, token: reset.token });
};

export const resetPassword = async (req, res) => {
  const { password, token, userId } = req.body;

  const savedToken = await ResetPasswordModel.findOne({ accountId: userId });
  if (savedToken.token !== token) {
    throw new ValidationError("some thing went wrong!");
  }
  const user = await AccountModel.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  user.password = password;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
};

export const getUser = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  const populateOptions = { path: "profile" };
  if (role === "contractor") {
    populateOptions.populate = { path: "weeklySchedule" };
  }
  const user = await AccountModel.findById(userId).populate(populateOptions);
  return res.status(200).json({ user, success: true });
};

export const markUsersAsFirstTimeLogin = async (req, res) => {
  const { _id } = req.user._id;

  const user = await AccountModel.findByIdAndUpdate(_id, {
    isFirstLogin: true,
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  user.isFirstLogin = false;
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "User marked as first time login" });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const userId = req.user._id;

  const user = await AccountModel.findById(userId).select("+password");

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.provider === "google") {
    throw new ValidationError("You can't change password");
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new ValidationError("Invalid current password");
  }

  if (newPassword !== confirmNewPassword) {
    throw new ValidationError("Passwords do not match");
  }

  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
};

export const logout = async (req, res) => {
  const userId = req.user._id;

  const user = await AccountModel.findByIdAndUpdate(
    userId,
    {
      refreshToken: null,
    },
    { new: true }
  );
  if (!user) {
    throw new NotFoundError("User not found");
  }

  return res
    .status(200)
    .clearCookie("accessToken", defaultCookiesOptions)
    .clearCookie("refreshToken", defaultCookiesOptions)
    .json({ success: true, message: "Logout successful" });
};

export const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.headers("Authorization")?.replace("Bearer ", "");
  if (!incomingRefreshToken) {
    throw new AuthenticationError("Unauthorized request!");
  }

  const decodedToken = await jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await AccountModel.findById(decodedToken.id).select(
    "-password +refreshToken"
  );

  if (!user) {
    throw AuthenticationError("Invalid refresh Token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new AuthenticationError("Invalid refresh token", 440);
  }

  const accessToken = user.generateAccessToken();
  return res
    .status(200)
    .cookie("accessToken", accessToken, defaultCookiesOptions)
    .json({
      success: true,
      accessToken,
      message: "Access token refreshed successfully!",
    });
};
