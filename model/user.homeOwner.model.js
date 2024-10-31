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
    avatarUrl: {
      type: String,
    },
    isFirstLogin: { type: Boolean, default: true, required: true },
    profileCompleted: { type: Boolean, default: false, required: true },
    googleId: { type: String, trim: true },
    rating: { type: String, trim: true, default: "5" },
    provider: { type: String, required: true, enum: ["google", "credentials"] },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    bestTimeToContact: {
      type: String,
      trim: true,
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },

    propertyDetails: {
      propertyType: { type: String, trim: true },
      bedrooms: { type: Number },
      bathrooms: { type: Number },
      lotSize: { type: String, trim: true },
      propertyAge: { type: String, trim: true },
    },
    projectNeeds: {
      ProjectType: {
        homeRenovation: { type: Boolean, default: false },
        repairs: { type: Boolean, default: false },
        homeAddition: { type: Boolean, default: false },
        outdoorLandscaping: { type: Boolean, default: false },
        energy: { type: Boolean, default: false },
      },
      desireProjectTimeLine: { type: String, trim: true },
      estimateBudget: { type: String, trim: true },
      projectDescription: { type: String, trim: true },
    },
    specificArea: {
      roof: { type: Boolean, default: false },
      plumbing: { type: Boolean, default: false },
      electrical: { type: Boolean, default: false },
      HVAC: { type: Boolean, default: false },
      foundation: { type: Boolean, default: false },
      window: { type: Boolean, default: false },
      installation: { type: Boolean, default: false },
      additionalNotes: { type: String, trim: true },
    },
    contractorPreferences: {
      contractorSize: { type: String, trim: true },
      importantFactors: {
        competitivePricing: { type: Boolean, default: false },
        highQualityWorkManShip: { type: Boolean, default: false },
        quickCompletion: { type: Boolean, default: false },
        clearCommunication: { type: Boolean, default: false },
        ecoFriendly: { type: Boolean, default: false },
      },
    },
    additionalInformation: {
      pastRenovation: { type: String, trim: true },
      specialRequirements: { type: String, trim: true },
    },
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
