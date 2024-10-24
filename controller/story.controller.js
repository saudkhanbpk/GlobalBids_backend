import { InternalServerError } from "../error/AppError.js";
import CommentModel from "../model/comment.model.js";
import StoryModel from "../model/story.model.js";
import { uploadFile } from "../services/upload.files.media.service.js";
import LikeModel from "../model/like.story.model.js";
import ShareModel from "../model/share.model.js";

export const createStory = async (req, res, next) => {
  const { description } = req.body;
  const user = req.user;
  const userType = user.role === "owner" ? "Homeowner" : "Contractor";
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
      userType,
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
    return next(new InternalServerError("Can't post story"));
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
  const { comment, storyId } = req.body;
  const user = req.user;
  const userType = user.role === "owner" ? "Homeowner" : "Contractor";
  try {
    const newComment = new CommentModel({
      user: user._id,
      userType,
      story: storyId,
      comment,
    });
    await newComment.save();
    return res.status(201).json({
      success: true,
      comment: newComment,
      message: "Comment Added",
    });
  } catch (error) {
    console.log(error);

    return next(new InternalServerError("Can't comment"));
  }
};

export const getStoryDetails = async (req, res, next) => {
  const storyId = req.params.id;
  const userId = req.user._id;

  try {
    const comments = await CommentModel.find({ story: storyId }).populate({
      path: "user",
      select: "username imageUrl",
    });

    const totalComments = await CommentModel.countDocuments({ story: storyId });
    const totalLikes = await LikeModel.countDocuments({ story: storyId });
    const totalShares = await ShareModel.countDocuments({ story: storyId });

    const hasLiked = await LikeModel.findOne({
      story: storyId,
      user: userId,
    });

    return res.status(200).json({
      success: true,
      comments,
      totalComments,
      totalLikes,
      totalShares,
      hasLiked: !!hasLiked,
    });
  } catch (error) {
    return next(new InternalServerError("Can't get all comments and likes"));
  }
};

export const toggleLike = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const userType = user.role === "owner" ? "Homeowner" : "Contractor";

  try {
    const existingLike = await LikeModel.findOne({
      story: id,

      user: user._id,
    });

    if (existingLike) {
      await LikeModel.deleteOne({ _id: existingLike._id });
      return res.status(200).json({ success: true, liked: false });
    } else {
      const newLike = new LikeModel({ user: user._id, story: id, userType });
      await newLike.save();
      return res.status(201).json({ success: true, liked: true });
    }
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const deleteComment = async (req, res, next) => {
  const { id } = req.params;

  try {
    await CommentModel.deleteOne({ _id: id });
    return res
      .status(200)
      .json({ success: true, id, message: "comment deleted!" });
  } catch (error) {
    return next(new InternalServerError("can't delete comment"));
  }
};
