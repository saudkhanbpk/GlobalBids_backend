import mongoose from "mongoose";

const eventsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
});

const EventsModel = mongoose.model("Events", eventsSchema);
export default EventsModel;
