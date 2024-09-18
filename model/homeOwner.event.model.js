import mongoose from "mongoose";

const HomeOwnerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
});

const HomeOwnerEventModel = mongoose.model("HomeOwnerEvent", HomeOwnerSchema);
export default HomeOwnerEventModel;
