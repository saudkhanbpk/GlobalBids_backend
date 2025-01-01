import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: false,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: function () {
        return !this.eventId;
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    timeZone: {
      type: String,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    status: {
      type: String,
      enum: ["delivered", "read"],
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
