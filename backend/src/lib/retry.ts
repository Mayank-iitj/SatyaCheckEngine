import { logger } from "./logger";

/**
 * Execute an async function with exponential backoff retries.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { retries?: number; initialDelay?: number; factor?: number } = {}
): Promise<T> {
  const retries = options.retries ?? 3;
  const initialDelay = options.initialDelay ?? 1000;
  const factor = options.factor ?? 2;

  let lastError: Error | unknown;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;

      logger.warn(
        { err: error, attempt, retries },
        `Operation failed, retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= factor;
    }
  }

  throw lastError;
}
