import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
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
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  workRole: {
    type: String,
    required: [true, "Work role is required"],
  },
  country: {
    type: String,
    required: [true, "Country is required"],
  },
  sendSms: {
    type: Boolean,
    default: false,
  },
  termsOfServices: {
    type: Boolean,
    required: [true, "Accepting terms of service is required"],
    default: false,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
    minlength: [8, "Password must be at least 8 characters long"],
    select: false, 
  },
}, {
  timestamps: true, 
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(new Error("Password hashing failed"));
  }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

userSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email }).select("+password");
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
