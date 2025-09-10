import { IPage } from '../../core/interfaces/browser.interface';
import { IBrowserManager } from '../../core/interfaces/browser.interface';
import { browserConfig } from '../../config/browser.config';
import { logger } from '../../utils/logger.util';
import { PageCreationError, NavigationError } from '../../errors/browser.error';
import { RetryUtil } from '../../utils/retry.util';

// Manages browser pages for different ticker symbols
export class PageManager {
  private pages: Map<string, IPage> = new Map();
  private browserManager: IBrowserManager;

  constructor(browserManager: IBrowserManager) {
    this.browserManager = browserManager;
  }

  // Create and configure page for a specific ticker
  async createPageForTicker(ticker: string): Promise<IPage> {
    if (this.pages.has(ticker)) {
      logger.debug(`Page already exists for ticker: ${ticker}`, 'PageManager');
      return this.pages.get(ticker)!;
    }

    try {
      logger.info(`Creating page for ticker: ${ticker}`, 'PageManager');
      
      const context = await this.browserManager.createContext();
      const page = await context.createPage();
      
      const url = `${browserConfig.baseUrl}/${ticker}/?exchange=${browserConfig.exchange}`;
      logger.debug(`Navigating to URL: ${url}`, 'PageManager');
      
      // Navigate to the page with retry logic
      await RetryUtil.withRetry(
        async () => {
          logger.debug(`Attempting navigation to: ${url}`, 'PageManager');
          await page.navigate(url);
          logger.debug(`Page navigated, waiting for selector: ${browserConfig.priceSelector}`, 'PageManager');
          await page.waitForSelector(browserConfig.priceSelector);
          logger.debug(`Selector found successfully`, 'PageManager');
        },
        { maxAttempts: 2, delay: 500 } // Reduced from 3 attempts with 2s delay to 2 attempts with 500ms delay
      );

      this.pages.set(ticker, page);
      logger.info(`Successfully created page for ticker: ${ticker}`, 'PageManager');
      
      return page;
    } catch (error) {
      logger.error(`Failed to create page for ticker ${ticker}`, 'PageManager', { error: error instanceof Error ? error.message : String(error) });
      throw new PageCreationError(`Could not create page for ticker ${ticker}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Close page for a specific ticker
  async closePageForTicker(ticker: string): Promise<void> {
    const page = this.pages.get(ticker);
    if (page) {
      try {
        logger.info(`Closing page for ticker: ${ticker}`, 'PageManager');
        await page.close();
        this.pages.delete(ticker);
        logger.info(`Successfully closed page for ticker: ${ticker}`, 'PageManager');
      } catch (error) {
        logger.error(`Error closing page for ticker ${ticker}`, 'PageManager', { error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  // Get page instance for a ticker
  getPageForTicker(ticker: string): IPage | undefined {
    return this.pages.get(ticker);
  }

  // Check if page exists for a ticker
  hasPageForTicker(ticker: string): boolean {
    return this.pages.has(ticker);
  }

  // Get list of all active tickers
  getActiveTickers(): string[] {
    return Array.from(this.pages.keys());
  }

  // Close all open pages
  async closeAllPages(): Promise<void> {
    logger.info('Closing all pages', 'PageManager');
    
    const closePromises = Array.from(this.pages.keys()).map(ticker => 
      this.closePageForTicker(ticker)
    );
    
    await Promise.allSettled(closePromises);
    logger.info('All pages closed', 'PageManager');
  }

  // Get total number of open pages
  getPageCount(): number {
    return this.pages.size;
  }
}
