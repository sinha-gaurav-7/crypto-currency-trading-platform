import { TRADING_CONSTANTS } from '../constants/trading.constants';

// Utility class for input validation and sanitization
export class ValidationUtil {
  // Validate ticker symbol format for URL safety
  public static validateTicker(ticker: string): boolean {
    if (!ticker || typeof ticker !== 'string') {
      return false;
    }

    // Basic validation: alphanumeric characters only, reasonable length
    const cleanTicker = ticker.trim();
    if (cleanTicker.length === 0 || cleanTicker.length > 20) {
      return false;
    }

    // Only allow alphanumeric characters for URL safety
    return /^[A-Za-z0-9]+$/.test(cleanTicker);
  }

  // Validate ticker for cryptocurrency trading
  public static validateCryptoTicker(ticker: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!ticker || typeof ticker !== 'string') {
      errors.push('Ticker is required and must be a string');
      return { isValid: false, errors };
    }

    const cleanTicker = ticker.trim();
    
    if (cleanTicker.length === 0) {
      errors.push('Ticker cannot be empty');
    } else if (cleanTicker.length > 20) {
      errors.push('Ticker is too long (max 20 characters)');
    } else if (!this.validateTicker(cleanTicker)) {
      errors.push('Invalid ticker format. Use only letters and numbers (e.g., BTCUSD, ETHUSD)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate request body structure
  public static validateAddTickerRequest(body: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!body || typeof body !== 'object') {
      errors.push('Request body must be an object');
      return { isValid: false, errors };
    }

    if (!body.ticker || typeof body.ticker !== 'string') {
      errors.push('Ticker field is required and must be a string');
    } else {
      // Use crypto-specific validation for cryptocurrency tickers
      const cryptoValidation = this.validateCryptoTicker(body.ticker);
      if (!cryptoValidation.isValid) {
        errors.push(...cryptoValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate remove ticker request
  public static validateRemoveTickerRequest(body: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!body || typeof body !== 'object') {
      errors.push('Request body must be an object');
      return { isValid: false, errors };
    }

    if (!body.ticker || typeof body.ticker !== 'string') {
      errors.push('Ticker field is required and must be a string');
    } else if (!this.validateTicker(body.ticker)) {
      errors.push('Invalid ticker format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Sanitize input strings
  public static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input.trim().replace(/[<>]/g, '');
  }

  // Validate HTTP method
  public static validateHttpMethod(method: string, allowedMethods: string[]): boolean {
    return allowedMethods.includes(method.toUpperCase());
  }
}
