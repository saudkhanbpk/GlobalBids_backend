import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}(\.[a-zA-Z]{2,3})?$/,
      "Please fill a valid email address",
    ],
  },
  firsName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  workRole: { type: String },
  country: { type: String },
  sendSms: { type: Boolean, default: false },
  termsOfServices: { type: Boolean, default: false },
  password: { type: String, trim: true },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
