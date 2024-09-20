import { InternalServerError } from "../error/AppError.js";
import StoryModel from "../model/story.model.js";
import { uploadFile } from "../services/upload.file.service.js";

export const createStory = async (req, res, next) => {
  const { description } = req.body;
  const user = req.user;
  let images = [];

  try {
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadFile(file, "stories");
        images.push(imageUrl);
      }
    }
    const newStory = new StoryModel({
      user: user._id,
      description,
      images,
    });

    const savedStory = await newStory.save();

    return res.status(201).json({
      success: true,
      message: "Story posted successfully",
      story: savedStory,
    });
  } catch (error) {
    return next(InternalServerError("Can't post story"));
  }
};
