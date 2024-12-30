import OpenAI, { InternalServerError } from "openai";
import { asyncHandler } from "../utils/asyncHandler.js";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatbot = asyncHandler(async (req, res, next) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [{ role: "user", content: "write a haiku about ai" }],
    });
    return res.status(200).json({ success: true, completion });
  } catch (error) {
    console.log(error);

    return next(new InternalServerError());
  }
});
