import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
    },
    startDate: { type: String },
    targetDate: { type: String },
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
    budget: {
      type: String,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
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
    contractorNotes: { type: String, trim: true },
    completed: { type: Boolean, default: false },
    progress: { type: String },
    startDate: { type: Date },
    estimateCompletion: { type: Date },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
    },
    HOA: { type: String, default: "no", required: true },
    accessDetails: { type: String },
    materials: { type: String },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
