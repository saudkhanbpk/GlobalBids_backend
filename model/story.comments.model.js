import mongoose from "mongoose";

const storyCommentsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const StoryCommentsModel = mongoose.model("StoryComment", storyCommentsSchema);
export default StoryCommentsModel;
