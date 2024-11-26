import express from "express";
import {
  createBid,
  getOwnerBids,
  getContractorBids,
  changeBidStatus,
  getBids,
  getBid,
  updateBid,
} from "../controller/bid.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createPayment,
  getPaymentHistory,
  updateBidPayment,
} from "../controller/stripe.controller.js";

const bidRouter = express.Router();

bidRouter.post("/create", authMiddleware, createBid);

// get owner bids
bidRouter.get("/owner", authMiddleware, getOwnerBids);

// get contractor bids
bidRouter.get("/contractor", authMiddleware, getContractorBids);

bidRouter.post("/create-payment-intent", createPayment);
bidRouter.get("/payment-history", authMiddleware, getPaymentHistory);
bidRouter.post("/status", authMiddleware, changeBidStatus);
bidRouter.get("/", authMiddleware, getBids);
bidRouter.post("/update-bid-payment", authMiddleware, updateBidPayment);
bidRouter.get("/:id", authMiddleware, getBid);
bidRouter.put("/:id", authMiddleware, updateBid);

export default bidRouter;
