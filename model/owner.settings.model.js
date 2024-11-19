import mongoose from "mongoose";

const ownerSettingSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emailNotification: { type: Boolean, default: false },
  smsNotification: { type: Boolean, default: false },
  inAppNotification: { type: Boolean, default: true },
  publicProfile: { type: Boolean, default: true },
  shareData: { type: Boolean, default: false },

  newBidsNotifications: { type: Boolean, default: true },
  newMessagesNotifications: { type: Boolean, default: true },

  sameDayProjectAlertsNotifications: { type: Boolean, default: true },
  sameDayProjectAlertsNotifications: { type: Boolean, default: true },
});

const OwnerSettingModel = mongoose.model("OwnerSetting", ownerSettingSchema);

export default OwnerSettingModel;
