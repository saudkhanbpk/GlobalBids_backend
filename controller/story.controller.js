import StoryModel from "../model/story.model.js";

export const createStory = async (req, res, next) => {
  const data = req.body;
  const user = req.user;

  try {
    const newStory = new StoryModel({
      user: user._id,
      
    });
  } catch (error) {}
};
