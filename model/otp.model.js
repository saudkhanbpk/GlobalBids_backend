import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  otp: { type: Number, required: true },
  otpType: {
    type: String,
    required: true,
    enum: ["verify-account", "login", "forgot-password"],
  },
  isVerified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
});

const OtpModel = mongoose.model("Otp", OtpSchema);
export default OtpModel;
