import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
    },
    description: { type: String },
    images: [{ type: String }],
    userType: {
      type: String,
      required: true,
      enum: ["Homeowner", "Contractor"],
    },
  },
  { timestamps: true }
);

const StoryModel = mongoose.model("Story", storySchema);

export default StoryModel;
