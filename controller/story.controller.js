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

export const getStoryFeeds = async (req, res, next) => {
  try {
    const stories = await StoryModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          description: 1,
          createdAt: 1,
          images: 1,
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          sharesCount: { $size: "$shares" },
          "user.username": 1,
          "user.imageUrl": 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, stories });
  } catch (error) {
    return next(new InternalServerError("Can't get stories"));
  }
};
