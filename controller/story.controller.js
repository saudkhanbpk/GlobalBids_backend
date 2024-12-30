import { InternalServerError } from "../error/AppError.js";
import CommentModel from "../model/comment.model.js";
import StoryModel from "../model/story.model.js";
import { uploadFile } from "../services/upload.files.media.service.js";
import LikeModel from "../model/like.story.model.js";
import ShareModel from "../model/share.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createStory = asyncHandler(async (req, res) => {
  const { description } = req.body;
  const user = req.user;

  let images = [];

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
  const populatedStory = await savedStory.populate({
    path: "user",
    select: "username avatarUrl",
  });

  return res.status(201).json({
    success: true,
    message: "Story posted successfully",
    story: populatedStory,
  });
});

export const getStoryFeeds = asyncHandler(async (_req, res) => {
  const stories = await StoryModel.find()
    .populate({
      path: "user",
      select: "username avatarUrl",
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, stories });
});

export const addComment = asyncHandler(async (req, res) => {
  const { comment, storyId } = req.body;
  const user = req.user;
  const userType = user.role === "owner" ? "Homeowner" : "Contractor";

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
});

export const getStoryDetails = asyncHandler(async (req, res) => {
  const storyId = req.params.id;
  const userId = req.user._id;

  const comments = await CommentModel.find({ story: storyId }).populate({
    path: "user",
    select: "username avatarUrl",
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
});

export const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const existingLike = await LikeModel.findOne({
    story: id,
    user: user._id,
  });

  if (existingLike) {
    await LikeModel.deleteOne({ _id: existingLike._id });
    return res.status(200).json({ success: true, liked: false });
  } else {
    const newLike = new LikeModel({ user: user._id, story: id });
    await newLike.save();
    return res.status(201).json({ success: true, liked: true });
  }
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await CommentModel.deleteOne({ _id: id });
  return res
    .status(200)
    .json({ success: true, id, message: "comment deleted!" });
});
