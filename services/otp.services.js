import OtpModel from "../model/otp.model.js";

export const getOtpById = async (id) => {
  const otp = await OtpModel.findById(id).populate({
    path: "userId",
    select: "email",
  });

  return otp;
};
