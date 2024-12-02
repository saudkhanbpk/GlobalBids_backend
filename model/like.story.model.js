import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Account",
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
  },
  { timestamps: true }
);

const LikeModel = mongoose.model("Like", LikeSchema);
export default LikeModel;
