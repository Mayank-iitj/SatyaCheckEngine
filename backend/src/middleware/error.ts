import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let error = err;

  if (!(error instanceof AppError)) {
    // Unhandled exception, convert to AppError or treat as 500
    logger.error({ err: error, stack: error.stack }, "Unhandled exception");
    error = new AppError("Internal server error", 500, false);
  } else {
    // Expected operational error
    if (error.statusCode >= 500) {
      logger.error({ err: error }, error.message);
    } else {
      logger.warn({ err: error }, error.message);
    }
  }

  const appError = error as AppError;

  res.status(appError.statusCode).json({
    error: appError.message,
    ...(process.env.NODE_ENV === "development" && !appError.isOperational ? { stack: err.stack } : {}),
  });
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
}
