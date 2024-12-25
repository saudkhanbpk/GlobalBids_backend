import mongoose from "mongoose";

const eventsSchema = new mongoose.Schema(
  {
    homeowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    eventType: {
      type: String,
      required: true,
      enum: ["installation", "general", "meetings", "reminder"],
    },
    title: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String },
    reminderId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    notified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const EventsModel = mongoose.model("Events", eventsSchema);
export default EventsModel;
