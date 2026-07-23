import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { BadRequestError } from "../lib/errors";
import { logger } from "../lib/logger";

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        logger.warn({ issues }, "Validation error");
        return next(new BadRequestError(`Validation failed: ${issues.join(", ")}`));
      }
      next(error);
    }
  };
};
