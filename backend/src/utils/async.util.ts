// Utility class for common asynchronous operations
export class AsyncUtil {
  // Delay execution for specified milliseconds
  public static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Add timeout to a promise
  public static timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
      ),
    ]);
  }

  // Execute async function with timeout
  public static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return this.timeout(operation(), timeoutMs);
  }

  // Create debounced function (delays execution)
  public static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Create throttled function (limits execution frequency)
  public static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Wait for condition to become true
  public static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeoutMs: number = 10000,
    checkInterval: number = 100
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (await condition()) {
        return true;
      }
      await this.delay(checkInterval);
    }
    
    return false;
  }
}
