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
      trim: true,
      default: "contractor",
    },
    password: {
      type: String,
      trim: true,
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
      validate: {
        validator: function (value) {
          return this.provider === "google" || (value && value.length >= 8);
        },
        message: "Password must be at least 8 characters long",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/tech-creator/image/upload/v1723793884/kvy9hb4hqyymv7mvcsy4.jpg",
    },
    googleId: { type: String, trim: true },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    rating: {
      type: Number,
      default: 5,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    label: { type: String, trim: true },
    insurance: {
      insuranceNumber: { type: String, trim: true },
      insuranceProvider: { type: String, trim: true },
      insuranceExpiryDate: { type: Date },
      file: { type: String, trim: true },
    },
    companyName: {
      name: { type: String, trim: true },
      EIN: { type: String, trim: true },
      licenseNumber: { type: String, trim: true },
    },
    business: {
      address: { type: String, trim: true },
      location: { type: String, trim: true },
    },
    services: [{ type: String, trim: true }],
    experience: { type: String, trim: true },
    certifications: { type: String, trim: true },
    onlinePresence: [{ type: String, trim: true }],
    provider: {
      type: String,
      required: true,
      enum: ["google", "credentials"],
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook for password hashing
userSchema.pre("save", async function (next) {
  if (this.provider !== "credentials") {
    return next();
  }

  if (!this.isModified("password")) return next();

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

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Static method to find user by email
userSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email }).select("+password");
};

const UserContractorModel = mongoose.model("Contractor", userSchema);

export default UserContractorModel;
