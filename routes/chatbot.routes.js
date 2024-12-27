import express from "express";
import { chatbot } from "../controller/chatbot.controller.js";

const chatbotRouter = express.Router();

chatbotRouter.post("/prompt", chatbot);

export default chatbotRouter;
