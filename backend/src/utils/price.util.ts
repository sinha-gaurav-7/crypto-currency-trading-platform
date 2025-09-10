import { SCRAPING_CONSTANTS } from '../constants/scraping.constants';

// Utility class for price validation and formatting
export class PriceUtil {
  // Validate if price string has valid format
  public static validatePrice(price: string): boolean {
    if (!price || typeof price !== 'string') {
      return false;
    }

    // Check if price contains digits and decimal/commas
    if (!SCRAPING_CONSTANTS.PRICE_VALIDATION_REGEX.test(price)) {
      return false;
    }

    // Check minimum length
    if (price.length < SCRAPING_CONSTANTS.MIN_PRICE_LENGTH) {
      return false;
    }

    return true;
  }

  // Clean up price text by removing whitespace and normalizing
  public static cleanPriceText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Remove extra whitespace and trim
    let cleaned = text.replace(SCRAPING_CONSTANTS.PRICE_CLEANUP_REGEX, '').trim();

    // Remove any non-price characters that might be mixed in
    cleaned = cleaned.replace(/[^\d.,]/g, '');

    return cleaned;
  }

  // Format price for consistent display
  public static formatPrice(price: string): string {
    const cleaned = this.cleanPriceText(price);
    
    if (!this.validatePrice(cleaned)) {
      return '';
    }

    // Ensure proper decimal formatting
    return cleaned.replace(/,/g, '.');
  }

  // Check if two prices are significantly different
  public static isPriceChanged(oldPrice: string, newPrice: string, threshold: number = 0.01): boolean {
    const old = parseFloat(oldPrice.replace(/,/g, ''));
    const new_ = parseFloat(newPrice.replace(/,/g, ''));

    if (isNaN(old) || isNaN(new_)) {
      return false;
    }

    const difference = Math.abs(new_ - old);
    const percentageChange = difference / old;

    return percentageChange >= threshold;
  }
}
