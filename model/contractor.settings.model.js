import mongoose from "mongoose";

const contractorSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notifications: {
    type: String,
    enum: ["enable", "disable"], 
    default: "enable",
  },
  profileVisibility: {
    type: String,
    enum: ["public", "private", "contractorOnly"],
    default: "public",
  },
});

const ContractorSettingsModel = mongoose.model(
  "ContractorSetting", 
  contractorSettingsSchema
);

export default ContractorSettingsModel;
