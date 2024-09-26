import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
    },
    userType: {
      type: String,
      required: true,
      enum: ["Homeowner", "Contractor"],
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
