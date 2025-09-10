// Web scraping configuration constants
export const SCRAPING_CONSTANTS = {
  PRICE_VALIDATION_REGEX: /[\d,.]/,                                        // Regex to validate price format
  MIN_PRICE_LENGTH: 1,                                                     // Minimum price string length
  PRICE_CLEANUP_REGEX: /\s+/g,                                             // Regex to clean price whitespace
  EXTRACTION_RETRY_DELAY: 1000,                                            // Retry delay between attempts (1s)
  MAX_EXTRACTION_ATTEMPTS: 3,                                              // Maximum retry attempts
  PRICE_UPDATE_THRESHOLD: 100,                                             // Min time between price updates (100ms)
  DOM_READY_TIMEOUT: 5000,                                                 // DOM ready timeout (5s)
  ELEMENT_VISIBILITY_TIMEOUT: 3000,                                        // Element visibility timeout (3s)
} as const;

// Scraping error messages for error handling
export const SCRAPING_ERRORS = {
  ELEMENT_NOT_FOUND: 'Required element not found on page',                  // Element missing error
  PRICE_EXTRACTION_FAILED: 'Failed to extract price from element',         // Price extraction error
  INVALID_PRICE_FORMAT: 'Extracted price has invalid format',              // Price format error
  DOM_NOT_READY: 'DOM elements not ready for extraction',                  // DOM not ready error
  ELEMENT_NOT_VISIBLE: 'Required element not visible on page',             // Element visibility error
} as const;
