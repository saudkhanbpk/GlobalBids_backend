import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    unreadMessagesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const MessageNotificationModel = mongoose.model("MessageNotification", notificationSchema);
export default MessageNotificationModel;
