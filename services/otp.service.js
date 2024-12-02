import OtpModel from "../model/otp.model.js";
import { generateOtp } from "../utils/generate-otp.js";
import { otpMailOptions } from "../utils/mail-options.js";
import { sendEmail } from "../utils/send-emails.js";

export const sendOtpToUser = async (user) => {

  const otpRecord = await OtpModel.findOne({  });

  if (otpRecord && otpRecord.count < 3) {
    otpRecord.count += 1;
    await otpRecord.save();
  } else {
    otpRecord = new OtpModel({
      otp: generateOtp(),
      userId: user._id,
      userType,
      count: 1,
    });
    await otpRecord.save();
  }

  const mailOpt = otpMailOptions(otpRecord.otp, user.email);
  await sendEmail(mailOpt);

  return {
    success: true,
    otpId: otpRecord._id,
    message: "OTP sent successfully",
  };
};


