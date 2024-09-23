import mongoose from "mongoose";

const ShareSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
  },
  { timestamps: true }
);
const ShareModel = mongoose.model("Share", ShareSchema);
export default ShareModel;
