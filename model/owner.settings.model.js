import mongoose from "mongoose";

const ownerSettingSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emailNotification: { type: Boolean, default: false },
  smsNotification: { type: Boolean, default: false },
  publicProfile: { type: Boolean, default: true },
  shareData: { type: Boolean, default: false },
});

const OwnerSettingModel = mongoose.model("OwnerSetting", ownerSettingSchema);

export default OwnerSettingModel;
