import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    workTitle: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    education: {
      type: String,
      trim: true,
    },
    languages: [
      {
        language: {
          type: String,
          trim: true,
        },
        level: {
          type: String,
          trim: true,
        },
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    hourlyRate: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    cityName: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      default:
        "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?w=740&t=st=1723716515~exp=1723717115~hmac=10dd0f1942c2b0b97fce83f703730b1a7fdef5bde66fa8eea8528543c6da0aed",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProfileModel = mongoose.model("Profile", profileSchema);

export default ProfileModel;
