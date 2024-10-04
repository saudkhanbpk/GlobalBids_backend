import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    otp: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
    },
    userType: {
      type: String,
      required: true,
      enum: ["Homeowner", "Contractor"],
    },
    count: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

otpSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300, partialFilterExpression: { state: "TMP" } }
);

const OtpModel = mongoose.model("verification-otp", otpSchema);

export default OtpModel;
