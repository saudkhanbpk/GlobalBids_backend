import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String },
    images: [{ type: String }],
  },
  { timestamps: true }
);

const StoryModel = mongoose.model("Story", storySchema);

export default StoryModel;
