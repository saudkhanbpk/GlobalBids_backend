import mongoose from "mongoose";

const resetPasswordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: { type: String },
});

const ResetPasswordModel = mongoose.model("ResetPassword", resetPasswordSchema);
export default ResetPasswordModel;
