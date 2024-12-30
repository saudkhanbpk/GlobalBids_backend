import mongoose from "mongoose";

const ContractorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    rating: {
      type: Number,
      default: 5.0,
      min: [1.0, "Rating must be at least 1"],
      max: [5.0, "Rating cannot exceed 5"],
    },
    label: { type: String, trim: true },
    insurance: {
      insuranceNumber: { type: String, trim: true },
      insuranceProvider: { type: String, trim: true },
      insuranceExpiryDate: { type: Date },
    },
    company: {
      name: { type: String, trim: true },
      employerID: { type: String, trim: true },
      licenseNumber: { type: String, trim: true },
      workerCompensationStatus: { type: String, trim: true },
    },
    insuranceFile: { type: String, trim: true },
    compensationFile: { type: String, trim: true },
    business: {
      address: { type: String, trim: true },
      location: {
        latitude: { type: String },
        longitude: { type: String },
      },
    },
    services: [{ type: String, trim: true }],
    experience: { type: String, trim: true },
    expertise: { type: String, trim: true },
    onlinePresence: {
      companyWebsite: { type: String, trim: true },
      googleReviewLink: { type: String, trim: true },
      facebookProfileLink: { type: String, trim: true },
      instagramProfileLink: { type: String, trim: true },
    },
    pageServices: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    portfolioMedia: [{ type: String, trim: true, default: [] }],
    coverPhoto: { type: String, trim: true },
    about: { type: String, trim: true },
    weeklySchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklySchedule",
    },
  },
  {
    timestamps: true,
  }
);

const ContractorProfileModel = mongoose.model(
  "ContractorProfile",
  ContractorProfileSchema
);

export default ContractorProfileModel;
