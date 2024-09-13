import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./config/db.js";
import errorHandler from "./error/errorHandler.js";
import { RouteNotFoundError } from "./error/AppError.js";
import jobsRouter from "./routes/jobs.routes.js";
import contractorRouter from "./routes/contractor.routes.js";
import ownerRoutes from "./routes/owner.routes.js";
import bidRouter from "./routes/bid.routes.js";
import storyRouter from "./routes/story.routes.js";

dotenv.config();
const app = express();
connectDB();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: true }));
app.use(errorHandler);

app.get("/", (_req, res) => {
  return res.status(200).json({ message: "Hello GlobalBids!" });
});

app.use("/api/auth/", authRoutes);
app.use("/api/job/", jobsRouter);
app.use("/api/contractor/", contractorRouter);
app.use("/api/owner/", ownerRoutes);
app.use("/api/bid/", bidRouter);
app.use("/api/story/", storyRouter)

app.all("*", (req, res, next) => {
  const err = new RouteNotFoundError(
    `Can't find ${req.originalUrl} on the server!`
  );
  return next(err);
});
app.use(errorHandler);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running on the port ${port}`);
});
