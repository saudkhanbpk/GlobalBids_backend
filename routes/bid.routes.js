import express from "express";
import {
  createBid,
  getOwnerBids,
  getContractorBids,
  changeBidStatus,
  getBid,
} from "../controller/bid.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../config/multer.config.js";

const bidRouter = express.Router();

bidRouter.post("/create", authMiddleware, upload.array("files", 2), createBid);

// get owner bids
bidRouter.get("/owner", authMiddleware, getOwnerBids);

// get contractor bids
bidRouter.get("/contractor", authMiddleware, getContractorBids);

bidRouter.post("/status", authMiddleware, changeBidStatus);
bidRouter.get("/:id", authMiddleware, getBid);

export default bidRouter;
