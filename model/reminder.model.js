import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    reminderName: {
      type: String,
      required: true,
      trim: true,
    },
    insuranceProvider: {
      type: String,
      required: true,
      trim: true,
    },
    policyNumber: {
      type: String,
      required: true,
      unique: true,
    },
    renewalDate: {
      type: Date,
      required: true,
    },
    policyAmount: {
      type: Number,
      min: 0,
    },
    renewalFrequency: {
      type: String,
      enum: ["Annually", "Semi-Annually", "Quarterly", "Monthly"],
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
      required: true,
    },
  },
  { timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
