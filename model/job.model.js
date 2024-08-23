import mongoose from "mongoose";

const JobSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    deadLine: { type: String, required: true },
    estimateCost: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: Boolean, default: false },
    fileUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

const JobModel = mongoose.model("Job", JobSchema);

export default JobModel;
