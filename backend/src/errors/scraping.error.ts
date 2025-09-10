import { BaseError } from './base.error';

// Base scraping error for all web scraping issues
export class ScrapingError extends BaseError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, true);
  }
}

// Error thrown when price extraction fails
export class PriceExtractionError extends ScrapingError {
  constructor(message: string = 'Failed to extract price') {
    super(message, 500);
  }
}

// Error thrown when required DOM element is not found
export class ElementNotFoundError extends ScrapingError {
  constructor(message: string = 'Required element not found') {
    super(message, 500);
  }
}

// Error thrown when extracted price has invalid format
export class InvalidPriceFormatError extends ScrapingError {
  constructor(message: string = 'Invalid price format') {
    super(message, 400);
  }
}

// Error thrown when cryptocurrency ticker is invalid
export class InvalidCryptoTickerError extends ScrapingError {
  constructor(message: string = 'Invalid cryptocurrency ticker') {
    super(message, 400);
  }
}

// Error thrown when exchange is not supported
export class UnsupportedExchangeError extends ScrapingError {
  constructor(message: string = 'Unsupported exchange') {
    super(message, 400);
  }
}
