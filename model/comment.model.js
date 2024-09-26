import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
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
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const CommentModel = mongoose.model("Comment", CommentSchema);
export default CommentModel;
