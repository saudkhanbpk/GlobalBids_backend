import { AppError } from "./AppError.js";

const errorHandler = (err, req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  if (err instanceof AppError) {
    err.logError();

    res.status(err.statusCode).json({
      success: false,
      type: err.getErrorType(),
      message: err.message,
      timestamp: err.timestamp,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } else {
    console.error("Unknown error occurred:", err);

    res.status(500).json({
      success: false,
      type: "Unknown Error",
      message: "An unexpected error occurred.",
      timestamp: new Date().toISOString(),
    });
  }
};

export default errorHandler;
