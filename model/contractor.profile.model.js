import mongoose from "mongoose";

const contractorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  licenseNumber: { type: String, trim: true },
  insuranceInformation: { type: String, trim: true },
  services: [{ type: String, trim: true }],
  professionalExperience: [{ type: String, trim: true }],
  customerReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reviews" }],
});

const ContractorProfileModel = mongoose.model(
  "ContractorProfileModel",
  contractorProfileSchema
);

export default ContractorProfileModel;
