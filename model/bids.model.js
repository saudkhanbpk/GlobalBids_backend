import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    comment: { type: String, required: true },
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
  },
  { timestamps: true }
);

const BidSchema = new mongoose.Schema(
  {
    amount: { type: String, required: true },
    bidBreakdown: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
      required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true,
    },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    status: {
      type: String,
      enum: ["accepted", "rejected", "pending"],
      default: "pending",
    },
    stages: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        estimatedCompletion: { type: Date, required: true },
      },
    ],
    comments: [CommentSchema],
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

const BidModel = mongoose.model("Bid", BidSchema);
export default BidModel;
