// Configuration options for retry operations
export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
  maxDelay?: number;
}

// Utility class for retry operations with exponential backoff
export class RetryUtil {
  // Execute function with retry logic and exponential backoff
  public static async withRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config: RetryOptions = {
      maxAttempts: 3,
      delay: 1000,
      backoffMultiplier: 2,
      maxDelay: 10000,
      ...options,
    };

    let lastError: Error;
    let currentDelay = config.delay;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === config.maxAttempts) {
          throw lastError;
        }

        // Wait before retrying
        await this.delay(currentDelay);
        
        // Apply backoff for next attempt
        currentDelay = Math.min(
          currentDelay * (config.backoffMultiplier || 2),
          config.maxDelay || 10000
        );
      }
    }

    throw lastError!;
  }

  // Delay execution for specified milliseconds
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Create retry wrapper for a function
  public static createRetryWrapper<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: Partial<RetryOptions> = {}
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      return this.withRetry(() => fn(...args), options);
    };
  }
}
