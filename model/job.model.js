import mongoose from "mongoose";

const JobSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endDate: { type: String, required: true },
    endTime: { type: String, required: true },
    budgetType: { type: String, required: true },
    estimateCost: { type: String, required: true },
    location: { type: String, required: true },
    fileUrl: { type: String },
    draft: { type: Boolean, default: false },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  },
  {
    timestamps: true,
  }
);

JobSchema.pre("save", function (next) {
  if (this.isModified("estimateCost")) {
    this.estimateCost = `${this.fromRate} - ${this.toRate}`;
  }
  next();
});

const JobModel = mongoose.model("Job", JobSchema);

export default JobModel;
