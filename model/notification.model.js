import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"Account"
    },
    recipient: {
      type: String,
      required: true,
      enum: ["Contractor", "Homeowner"],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      enum: ["Contractor", "Homeowner", "Admin"],
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
    },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model("Notification", notificationSchema);
export default NotificationModel;
