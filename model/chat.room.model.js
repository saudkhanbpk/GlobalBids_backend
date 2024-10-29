import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "userTypes",
      },
    ],
    userTypes: [
      {
        type: String,
        required: true,
        enum: ["Homeowner", "Contractor"],
      },
    ],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    last_message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    unreadMessages: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

const RoomModel = mongoose.model("ChatRoom", roomSchema);
export default RoomModel;
