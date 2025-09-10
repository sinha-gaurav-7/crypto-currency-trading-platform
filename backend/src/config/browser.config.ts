import { BROWSER_CONSTANTS } from '../constants/browser.constants';

// Browser automation configuration for web scraping
export const browserConfig = {
  headless: BROWSER_CONSTANTS.HEADLESS,                                    // Run browser in headless mode
  args: BROWSER_CONSTANTS.ARGS,                                            // Browser launch arguments
  userAgent: BROWSER_CONSTANTS.USER_AGENT,                                 // Custom user agent string
  navigationTimeout: BROWSER_CONSTANTS.NAVIGATION_TIMEOUT,                  // Page navigation timeout
  selectorTimeout: BROWSER_CONSTANTS.SELECTOR_TIMEOUT,                      // Element selector timeout
  priceSelector: BROWSER_CONSTANTS.PRICE_SELECTOR,                         // CSS selector for price extraction
  baseUrl: BROWSER_CONSTANTS.BASE_URL,                                     // Base URL for scraping
  exchange: BROWSER_CONSTANTS.EXCHANGE,                                    // Target exchange name
  maxConcurrentPages: parseInt(process.env.MAX_CONCURRENT_PAGES || '10'),  // Max concurrent browser pages
  pagePoolSize: parseInt(process.env.PAGE_POOL_SIZE || '5'),               // Page pool size for reuse
} as const;
