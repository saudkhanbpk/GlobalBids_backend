import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./config/db.js";
import errorHandler from "./error/errorHandler.js";
import { RouteNotFoundError } from "./error/AppError.js";
import profileRouter from "./routes/profile.routes.js";
dotenv.config();

const app = express();
connectDB();
// app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ origin: true }));
app.use(errorHandler);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Hello GlobalBids!" });
});

app.use("/api/auth/", authRoutes);
app.use("/api/profile/", profileRouter);

app.use(errorHandler);
app.all("*", (req, res, next) => {
  const err = new RouteNotFoundError(
    `Can't find ${req.originalUrl} on the server!`
  );
  next(err);
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running on the port ${port}`);
});
