import mongoose from "mongoose";

const otpSchema = mongoose.Schema(
  {
    otp: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

otpSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300000, partialFilterExpression: { state: "TMP" } }
);

const OtpModel = mongoose.model("verification-otp", otpSchema);

export default OtpModel;
