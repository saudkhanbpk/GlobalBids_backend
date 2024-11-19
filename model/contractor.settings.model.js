import mongoose from "mongoose";

const contractorSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  publicProfile: {
    type: Boolean,
    default: true,
  },
  shareData: {
    type: Boolean,
    default: true,
  },
  newJobPostingMatchesNotifications: { type: Boolean, default: true },
  bidAcceptedNotifications: { type: Boolean, default: true },
  newMessagesNotifications: { type: Boolean, default: true },
  sameDayProjectAlertsNotifications: { type: Boolean, default: true },
  missedDeadlinesNotifications: { type: Boolean, default: true },
  inAppNotifications: { type: Boolean, default: true },
  emailNotification: { type: Boolean, default: true },
  smsNotification: { type: Boolean, default: false },
});

const ContractorSettingsModel = mongoose.model(
  "ContractorSetting",
  contractorSettingsSchema
);

export default ContractorSettingsModel;
