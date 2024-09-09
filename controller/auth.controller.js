import UserModel from "../model/user.model.js";
import {
  ValidationError,
  InternalServerError,
  LoginError,
} from "../error/AppError.js";
import generateAuthToken from "../utils/generte-auth-token.js";
import { getUserByEmail, getUserById } from "../services/user.service.js";
import { signUpValidate } from "../validators/sign-up-validators.js";
import OtpModel from "../model/otp.model.js";
import { generateOtp } from "../utils/generate-otp.js";
import { sendEmail } from "../utils/send-emails.js";
import { otpMailOptions } from "../utils/mail-options.js";
import { uploadProfileImage } from "../services/upload.image.service.js";

export const signUpController = async (req, res, next) => {
  const userData = req.body;

  const validateData = signUpValidate(userData);

  if (validateData) {
    return next(new ValidationError(JSON.stringify(validateData)));
  }

  try {
    const user = new UserModel(userData);

    const newUser = await user.save();

    const newOtp = await OtpModel({
      otp: generateOtp(),
      userId: newUser._id,
    });

    await newOtp.save();

    const mailOpt = otpMailOptions(newOtp.otp, newUser.email);
    await sendEmail(mailOpt);

    const token = await generateAuthToken({
      id: newUser._id,
      email: newUser.email,
    });
    return res.status(201).json({
      success: true,
      message: "Please verify your account",
      user: newUser,
      token,
      otpId: newOtp._id,
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
    return next(new ValidationError("Email and Password is Required"));
  }

  try {
    const user = await getUserByEmail(email);
    // if (!user.isVerified) {
    //   return next(new UnauthorizedError("please verify your account first"));
    // }

    if (!user) {
      return next(new LoginError());
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

const updateUserInfo = async (req, res, next) => {
  const { email, username, role, licenseNumber, insuranceInformation } =
    req.body;

  const userId = req.user._id;
  const file = req.file;
  console.log(req.user, userId);

  let imageUrl = "";
  if (file) {
    imageUrl = await uploadProfileImage(file);
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    user.email = email || user.email;
    user.username = username || user.username;
    user.role = role || user.role;
    user.licenseNumber = licenseNumber || user.licenseNumber;
    user.insuranceInformation =
      insuranceInformation || user.insuranceInformation;
    user.imageUrl = imageUrl || user.imageUrl;

    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    error.logError();
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return next(error);
    }

    const serverError = new InternalServerError(
      "An error occurred while updating user information"
    );

    return next(serverError);
  }
};

export { updateUserInfo };
