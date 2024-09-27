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
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    timeZone: {
      type: String,
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
