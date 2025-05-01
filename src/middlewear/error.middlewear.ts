import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-errors";
import logger from "../config/logger";

const errorMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    const { statusCode, message, isOperational } = err;

    if (isOperational) {
      return res.status(statusCode).json({
        success: false,
        message,
      });
    }

    logger.error("Unexpected error:", err);
  } else {
    logger.error("Unexpected error:", err);
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

export default errorMiddleware;
