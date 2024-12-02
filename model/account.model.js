import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
const accountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    username: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
      validate: {
        validator: function (value) {
          return this.provider === "google" || value?.length >= 8;
        },
        message: "Password is required and must be at least 8 characters long",
      },
    },
    isVerified: { type: Boolean, default: false },
    avatarUrl: { type: String },
    coverPhoto: { type: String },
    provider: { type: String, required: true, enum: ["google", "credentials"] },
    isFirstLogin: { type: Boolean, default: true },
    profile: { type: mongoose.Schema.Types.ObjectId, refPath: "profileType" },
    settings: { type: mongoose.Schema.Types.ObjectId, refPath: "settingType" },
    googleId: { type: String, trim: true },
    role: {
      type: String,
      enum: ["homeowner", "contractor"],
    },
    settingType: {
      type: String,
      enum: ["HomeownerSettings", "ContractorSettings"],
    },
    profileType: {
      type: String,
      enum: ["HomeownerProfile", "ContractorProfile"],
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.pre("save", async function (next) {
  if (this.provider !== "credentials" || !this.isModified("password"))
    return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  } catch (error) {
    return next(error);
  }

  if (!this.username) {
    this.username = this.email.split("@")[0];
  }

  next();
});

accountSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

accountSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

accountSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const AccountModel = mongoose.model("Account", accountSchema);
export default AccountModel;
