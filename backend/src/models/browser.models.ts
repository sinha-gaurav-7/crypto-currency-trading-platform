// Extracted price data from web scraping
export interface PriceData {
  ticker: string;
  price: string;
  timestamp: number;
}

// Browser automation configuration
export interface BrowserConfig {
  headless: boolean;
  args: string[];
  userAgent: string;
  timeout: number;
}

// Page navigation and waiting configuration
export interface PageConfig {
  waitUntil: string;
  timeout: number;
  selector: string;
}

// Result of page navigation attempt
export interface NavigationResult {
  success: boolean;
  error?: string;
  timestamp: number;
}

// Result of price extraction attempt
export interface PriceExtractionResult {
  price: string | null;
  success: boolean;
  error?: string;
  timestamp: number;
}
