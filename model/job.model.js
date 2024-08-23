import mongoose from "mongoose";

const JobSchema = mongoose.Schema({
  title: { type: string, required: true },
  location: { type: string, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  deadLine: { type: string, required: true },
  estimateCost: { type: string, required: true },
  description: { type: string, required: true },
  status: { type: Boolean, default: false },
});

const JobModel = mongoose.model("Job", JobSchema);

export default JobModel;
