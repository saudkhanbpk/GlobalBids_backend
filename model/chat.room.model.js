import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  last_message: {
    message_id: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    content: { type: String },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date },
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const RoomModel = mongoose.model("ChatRoom", roomSchema);
export default RoomModel;
