import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
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
    budget: {
      type: Number,
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
    file: {
      type: String,
      required: true,
      trim: true,
    },
    bidStatus: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    jobType: {
      type: String,
      enum: ["project-based", "stages-based"],
      required: true,
    },
    stages: [
      {
        name: { type: String },
        description: { type: String },
        estimatedCompletion: { type: String },
      },
    ],
    projectDetails: {
      deadline: { type: Date },
      contractorNotes: { type: String },
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
