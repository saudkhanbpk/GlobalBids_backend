import mongoose from "mongoose";

const homeOwnerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const HomeOwnerProfileModel = mongoose.model(
  "HomeOwnerProfile",
  homeOwnerProfileSchema
);

export default HomeOwnerProfileModel;
