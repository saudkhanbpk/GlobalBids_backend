import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    media: [{ type: String }],
    homeowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FeedbackModel = mongoose.model("feedback", feedbackSchema);
export default FeedbackModel;
