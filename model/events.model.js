import mongoose from "mongoose";

const eventsSchema = new mongoose.Schema({
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
  eventType: {
    type: String,
    required: true,
    enum: ["installation", "general", "meetings"],
  },
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
});

const EventsModel = mongoose.model("Events", eventsSchema);
export default EventsModel;
