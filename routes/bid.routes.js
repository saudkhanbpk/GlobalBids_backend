import express from "express";
import {
  createBid,
  getContractorBids,
  changeBidStatus,
  getBids,
  getBid,
  updateBid,
  getHomeownerBids,
  bidEarningOverview,
} from "../controller/bid.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createPayment,
  getPaymentHistory,
  getHomeownerContact,
} from "../controller/stripe.controller.js";

const bidRouter = express.Router();

bidRouter.post("/create", authMiddleware, createBid);

// get homeowner bids
bidRouter.get("/homeowner", authMiddleware, getHomeownerBids);

// get contractor bids
bidRouter.get("/contractor", authMiddleware, getContractorBids);

bidRouter.post("/create-payment-intent", authMiddleware, createPayment);
bidRouter.get("/payment-history", authMiddleware, getPaymentHistory);
bidRouter.post("/status", authMiddleware, changeBidStatus);
bidRouter.get("/", authMiddleware, getBids);
bidRouter.post("/homeowner-contact/:id", authMiddleware, getHomeownerContact);
bidRouter.get("/earnings", authMiddleware, bidEarningOverview)

// ! these two routes will be end of these routes don't put new routes below these routes it will give you error 
bidRouter.get("/:id", authMiddleware, getBid);
bidRouter.put("/:id", authMiddleware, updateBid);

export default bidRouter;
