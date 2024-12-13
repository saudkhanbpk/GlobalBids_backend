import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    projectTimeLine: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: String,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        type: String,
        trim: true,
      },
    ],
    bidStatus: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    completed: { type: Boolean, default: false },
    progress: { type: String },
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
    acceptedBid: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    HOA: { type: String, default: "no", required: true },
    zipCode: { type: String },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
