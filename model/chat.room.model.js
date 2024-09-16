import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    last_message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

const RoomModel = mongoose.model("ChatRoom", roomSchema);
export default RoomModel;
