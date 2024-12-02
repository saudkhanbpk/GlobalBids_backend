import mongoose from "mongoose";

const homeOwnerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    rating: {
      type: Number,
      default: 5,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
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
      address: { type: String, trim: true },
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

const HomeownerProfileModel = mongoose.model(
  "HomeownerProfile",
  homeOwnerProfileSchema
);

export default HomeownerProfileModel;
