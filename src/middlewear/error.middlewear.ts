import { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/api-errors";
import logger from "../config/logger";

const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  console.log("Error middleware called:", err.message);

  if (err instanceof ApiError) {
    const { statusCode, message, isOperational } = err;

    if (isOperational) {
      res.status(statusCode).json({
        success: false,
        message,
      });
      return;
    }

    logger.error("Unexpected error:", err);
  } else {
    logger.error("Unexpected error:", err);
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

export default errorMiddleware;
