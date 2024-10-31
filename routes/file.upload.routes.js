import express from "express";
import upload from "../config/multer.config.js";
import { uploadAvatar } from "../controller/file.upload.controller.js";

const fileUploadRouter = express.Router();

fileUploadRouter.post("/avatar", upload.single("file"), uploadAvatar);


export default fileUploadRouter;
