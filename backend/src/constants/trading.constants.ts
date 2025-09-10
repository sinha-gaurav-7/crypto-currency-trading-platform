// Trading system configuration constants
export const TRADING_CONSTANTS = {
  POLLING_INTERVAL: 2000,                                                  // Price polling interval (2s)
  INITIAL_WAIT_TIME: 100,                                                  // Initial wait for client streaming (100ms)
  MAX_RETRY_ATTEMPTS: 2,                                                   // Maximum retry attempts for operations
  RETRY_DELAY: 500,                                                        // Delay between retries (500ms)
  PRICE_UPDATE_TIMEOUT: 5000,                                              // Price update timeout (5s)
  MAX_ACTIVE_TICKERS: 100,                                                 // Maximum active tickers allowed
  TICKER_VALIDATION_REGEX: /^[A-Z0-9]+$/,                                 // Regex to validate ticker format
} as const;

// Trading error messages for error handling
export const TRADING_ERRORS = {
  TICKER_ALREADY_EXISTS: 'Ticker already exists',                         // Duplicate ticker error
  TICKER_NOT_FOUND: 'Ticker not found',                                    // Ticker missing error
  INVALID_TICKER_FORMAT: 'Invalid ticker format',                          // Ticker format error
  MAX_TICKERS_REACHED: 'Maximum number of active tickers reached',         // Limit reached error
  PRICE_EXTRACTION_FAILED: 'Failed to extract price',                      // Price extraction error
  SUBSCRIPTION_FAILED: 'Failed to subscribe to ticker',                    // Subscription error
} as const;
