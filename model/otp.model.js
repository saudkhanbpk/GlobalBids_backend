import mongoose from "mongoose";

const otpSchema = mongoose.Schema(
  {
    otp: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    count: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

otpSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300 * 12, partialFilterExpression: { state: "TMP" } }
);

const OtpModel = mongoose.model("verification-otp", otpSchema);

export default OtpModel;
