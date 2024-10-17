import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
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
    role: {
      type: String,
      required: [true, "Work role is required"],
      default: "owner",
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
    },
    isFirstLogin: { type: Boolean, default: true },
    googleId: { type: String, trim: true },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    rating: { type: String, trim: true, default: "5" },
    label: { type: String, trim: true },
    provider: { type: String, required: true, enum: ["google", "credentials"] },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.provider === "google" || !this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  } catch (error) {
    return next(new Error("Password hashing failed"));
  }

  if (!this.username) {
    this.username = this.email.split("@")[0];
  }

  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

userSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email }).select("+password");
};

const UserHomeOwnerModel = mongoose.model("Homeowner", userSchema);

export default UserHomeOwnerModel;
