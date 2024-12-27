import OpenAI, { InternalServerError } from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatbot = async (req, res, next) => {
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
};
