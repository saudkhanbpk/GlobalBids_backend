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
      required: [true, "Password is required"],
      trim: true,
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
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
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    rating: { type: String, trim: true, default: "5" },
    label: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    insuranceInformation: { type: String, trim: true },
    services: [{ type: String, trim: true }],
    professionalExperience: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

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

const UserContractorModel = mongoose.model("Contractor", userSchema);

export default UserContractorModel;