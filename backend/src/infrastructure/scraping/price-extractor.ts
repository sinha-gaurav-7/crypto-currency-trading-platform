import { IPage } from '../../core/interfaces/browser.interface';
import { IPriceExtractor } from '../../core/interfaces/price-source.interface';
import { PriceData } from '../../models/browser.models';
import { browserConfig } from '../../config/browser.config';
import { PriceUtil } from '../../utils/price.util';
import { logger } from '../../utils/logger.util';
import { PriceExtractionError, ElementNotFoundError, InvalidPriceFormatError } from '../../errors/scraping.error';
import { RetryUtil } from '../../utils/retry.util';

// Extracts and validates price data from web pages
export class PriceExtractor implements IPriceExtractor {
  private page: IPage;

  constructor(page: IPage) {
    this.page = page;
  }

  // Extract price from configured selector with retry logic
  async extractPrice(): Promise<string | null> {
    try {
      logger.debug('Starting price extraction', 'PriceExtractor');
      
      // Use retry logic for price extraction
      return await RetryUtil.withRetry(
        async () => {
          logger.debug(`Looking for price selector: ${browserConfig.priceSelector}`, 'PriceExtractor');
          
          const priceElement = await this.page.extractText(browserConfig.priceSelector);
          
          if (!priceElement) {
            logger.warn('Price element not found', 'PriceExtractor');
            throw new ElementNotFoundError('Price element not found');
          }

          logger.debug(`Raw price text: ${priceElement}`, 'PriceExtractor');
          
          const cleanPrice = this.cleanPriceText(priceElement);
          
          if (!this.validatePrice(cleanPrice)) {
            logger.warn(`Invalid price format: ${cleanPrice}`, 'PriceExtractor');
            throw new InvalidPriceFormatError(`Invalid price format: ${cleanPrice}`);
          }

          logger.debug(`Successfully extracted price: ${cleanPrice}`, 'PriceExtractor');
          return cleanPrice;
        },
        { maxAttempts: 3, delay: 1000 }
      );
    } catch (error) {
      logger.error('Error extracting price', 'PriceExtractor', { error: error instanceof Error ? error.message : String(error) });
      
      if (error instanceof ElementNotFoundError || error instanceof InvalidPriceFormatError) {
        throw error;
      }
      
      throw new PriceExtractionError(`Failed to extract price: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Extract price from a specific DOM element
  async extractPriceFromElement(element: any): Promise<string | null> {
    if (!element) {
      return null;
    }

    try {
      const textContent = await element.textContent();
      if (!textContent) {
        return null;
      }

      const cleanPrice = this.cleanPriceText(textContent);
      return this.validatePrice(cleanPrice) ? cleanPrice : null;
    } catch (error) {
      logger.error('Error extracting price from element', 'PriceExtractor', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  // Validate extracted price format
  validatePrice(price: string): boolean {
    return PriceUtil.validatePrice(price);
  }

  // Clean and normalize price text
  cleanPriceText(text: string): string {
    return PriceUtil.cleanPriceText(text);
  }

  // Extract price with timestamp for data logging
  async extractPriceWithTimestamp(): Promise<PriceData | null> {
    const price = await this.extractPrice();
    if (price) {
      return {
        ticker: '', // Will be set by caller
        price,
        timestamp: Date.now(),
      };
    }
    return null;
  }

  // Wait for price element to appear on page
  async waitForPriceElement(timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(browserConfig.priceSelector, timeout);
      return true;
    } catch (error) {
      logger.warn('Price element not found within timeout', 'PriceExtractor', { timeout });
      return false;
    }
  }
}
