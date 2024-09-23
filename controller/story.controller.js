import { InternalServerError } from "../error/AppError.js";
import CommentModel from "../model/comment.model.js";
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

export const getStoryFeeds = async (_req, res, next) => {
  try {
    const stories = await StoryModel.find()
      .populate({
        path: "user",
        select: "username imageUrl",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, stories });
  } catch (error) {
    return next(new InternalServerError("Can't get stories"));
  }
};

export const addComment = async (req, res, next) => {
  const { userId, comment, StoryId } = req.body;
  try {
    const newComment = new CommentModel({
      user: userId,
      story: StoryId,
      comment,
    });
    await newComment.save();
    return res.status(201).json({
      success: true,
      message: "Added commented successFull",
    });
  } catch (error) {}
};
