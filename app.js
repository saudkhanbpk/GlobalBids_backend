import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
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
import projectRouter from "./routes/project.routes.js";
import initSocket from "./event/site-events.js";
import chatRouter from "./routes/chat.routes.js";
import eventRouter from "./routes/event.routes.js";
import notificationRouter from "./routes/notifications.routes.js";
import oAuthRoutes from "./routes/auth.google.routes.js";
import passport from "./config/passport.config.js";
import reminderRouter from "./routes/reminder.routes.js";

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

app.use(passport.initialize());

app.use(oAuthRoutes);
app.use("/api/auth/", authRoutes);
app.use("/api/job/", jobsRouter);
app.use("/api/contractor/", contractorRouter);
app.use("/api/owner/", ownerRoutes);
app.use("/api/bid/", bidRouter);
app.use("/api/project/", projectRouter);
app.use("/api/chat/", chatRouter);
app.use("/api/event/", eventRouter);
app.use("/api/story/", storyRouter);
app.use("/api/notifications/", notificationRouter);
app.use("/api/reminders/", reminderRouter);

app.all("*", (req, res, next) => {
  const err = new RouteNotFoundError(
    `Can't find ${req.originalUrl} on the server!`
  );
  return next(err);
});
app.use(errorHandler);

const port = process.env.PORT;
const server = http.createServer(app);
const io = initSocket(server);
app.set("io", io);
server.listen(port, () => {
  console.log(`server is running on the port ${port}`);
});
