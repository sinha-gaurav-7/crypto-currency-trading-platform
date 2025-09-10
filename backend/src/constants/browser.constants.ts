// Browser automation constants for web scraping
export const BROWSER_CONSTANTS = {
  HEADLESS: false,                                                          // Run browser in headed mode for visibility
  ARGS: ['--no-sandbox', '--disable-setuid-sandbox'],                      // Browser launch arguments
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // Browser user agent
  NAVIGATION_TIMEOUT: 10000,                                               // Page navigation timeout (10s)
  SELECTOR_TIMEOUT: 5000,                                                  // Element selector timeout (5s)
  PRICE_SELECTOR: '.js-symbol-last',                                       // CSS selector for price extraction
  BASE_URL: 'https://www.tradingview.com/symbols',                         // Base URL for scraping
  EXCHANGE: 'BINANCE',                                                     // Target exchange name
} as const;

// Browser error messages for error handling
export const BROWSER_ERRORS = {
  BROWSER_INIT_FAILED: 'Failed to initialize browser',                     // Browser startup error
  CONTEXT_CREATION_FAILED: 'Failed to create browser context',             // Context creation error
  PAGE_CREATION_FAILED: 'Failed to create page',                           // Page creation error
  NAVIGATION_FAILED: 'Failed to navigate to page',                         // Navigation error
  SELECTOR_NOT_FOUND: 'Required selector not found on page',               // Selector missing error
  PAGE_CRASHED: 'Page crashed unexpectedly',                               // Page crash error
  CONTEXT_CLOSED: 'Browser context was closed',                            // Context closed error
} as const;
