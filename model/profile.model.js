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
      required: [true, "Work title is required"],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
      trim: true,
    },
    education: {
      type: String,
      required: [true, "Education is required"],
      trim: true,
    },
    languages: [
      {
        language: {
          type: String,
          required: [true, "At least one language is required"],
          trim: true,
        },
        level: {
          type: String,
          required: [true, "At least one language is required"],
          trim: true,
        },
      },
    ],
    skills: [
      {
        type: String,
        required: [true, "At least one skill is required"],
        trim: true,
      },
    ],
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    hourlyRate: {
      type: String,
      required: [true, "Hourly rate is required"],
      trim: true,
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
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    cityName: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, "Zip code is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
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
