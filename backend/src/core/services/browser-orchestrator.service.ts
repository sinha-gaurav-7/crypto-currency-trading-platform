import { IBrowserManager } from '../interfaces/browser.interface';
import { PageManager } from '../../infrastructure/browser/page-manager';
import { PriceExtractor } from '../../infrastructure/scraping/price-extractor';
import { PriceMonitor } from '../../infrastructure/monitoring/price-monitor';
import { SubscriptionManager } from '../../infrastructure/monitoring/subscription-manager';
import { PriceData } from '../../models/browser.models';
import { PriceUpdate } from '../../models/trading.models';
import { logger } from '../../utils/logger.util';
import { ValidationUtil } from '../../utils/validation.util';
import { TRADING_CONSTANTS } from '../../constants/trading.constants';

// Orchestrates browser automation for price monitoring and streaming
export class BrowserOrchestratorService {
  private pageManager: PageManager;
  private subscriptionManager: SubscriptionManager;
  private priceMonitors: Map<string, PriceMonitor> = new Map();
  private tickerCallbacks: Map<string, (priceData: PriceData) => void> = new Map();

  constructor(browserManager: IBrowserManager) {
    this.pageManager = new PageManager(browserManager);
    this.subscriptionManager = new SubscriptionManager();
  }

  // Subscribe to real-time price updates for a ticker
  async subscribeToPrices(ticker: string, callback: (priceData: PriceData) => void): Promise<void> {
    // Validate ticker format for URL safety
    const tickerValidation = ValidationUtil.validateCryptoTicker(ticker);
    if (!tickerValidation.isValid) {
      throw new Error(`Ticker validation failed: ${tickerValidation.errors.join(', ')}`);
    }

    // Check if already subscribed
    if (this.tickerCallbacks.has(ticker)) {
      logger.warn(`Already subscribed to ${ticker}`, 'BrowserOrchestratorService');
      return;
    }

    try {
      logger.info(`Setting up price monitoring for ${ticker}`, 'BrowserOrchestratorService');

      // Create page for this ticker
      const page = await this.pageManager.createPageForTicker(ticker);
      
      // Create price extractor
      const priceExtractor = new PriceExtractor(page);
      
      // Create price monitor
      const priceMonitor = new PriceMonitor(
        priceExtractor,
        ticker,
        (priceData: PriceData) => {
          // Convert PriceData to PriceUpdate and notify subscribers
          const update = this.subscriptionManager.convertPriceDataToUpdate(priceData);
          this.subscriptionManager.notifySubscribers(ticker, update);
          
          // Also call the original callback
          callback(priceData);
        }
      );

      // Store the monitor and callback
      this.priceMonitors.set(ticker, priceMonitor);
      this.tickerCallbacks.set(ticker, callback);

      // Start price monitoring
      priceMonitor.startPolling(TRADING_CONSTANTS.POLLING_INTERVAL);

      // Subscribe to the subscription manager
      await this.subscriptionManager.subscribe(ticker, (update: PriceUpdate) => {
        // This will be called when prices are updated
        logger.debug(`Price update received for ${ticker}: ${update.price}`, 'BrowserOrchestratorService');
      });

      logger.info(`Successfully subscribed to ${ticker} prices`, 'BrowserOrchestratorService');
    } catch (error) {
      logger.error(`Failed to subscribe to ${ticker} prices`, 'BrowserOrchestratorService', { error: error instanceof Error ? error.message : String(error) });
      throw new Error(`Could not subscribe to ticker ${ticker}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Unsubscribe from price updates for a ticker
  async unsubscribeFromPrices(ticker: string, callback: (priceData: PriceData) => void): Promise<void> {
    try {
      logger.info(`Unsubscribing from ${ticker} prices`, 'BrowserOrchestratorService');

      // Stop price monitoring
      const priceMonitor = this.priceMonitors.get(ticker);
      if (priceMonitor) {
        priceMonitor.stopPolling();
        this.priceMonitors.delete(ticker);
      }

      // Remove callback
      this.tickerCallbacks.delete(ticker);

      // Close page if no more subscribers
      if (!this.subscriptionManager.hasSubscribers(ticker)) {
        await this.pageManager.closePageForTicker(ticker);
      }

      logger.info(`Successfully unsubscribed from ${ticker} prices`, 'BrowserOrchestratorService');
    } catch (error) {
      logger.error(`Failed to unsubscribe from ${ticker} prices`, 'BrowserOrchestratorService', { error: error instanceof Error ? error.message : String(error) });
      throw new Error(`Could not unsubscribe from ticker ${ticker}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get list of active tickers being monitored
  getActiveTickers(): string[] {
    return this.pageManager.getActiveTickers();
  }

  // Get current price for a specific ticker
  getCurrentPrice(ticker: string): string | null {
    const priceMonitor = this.priceMonitors.get(ticker);
    if (priceMonitor) {
      return priceMonitor.getCurrentPrice();
    }
    return null;
  }

  // Get number of subscribers for a ticker
  getSubscriberCount(ticker: string): number {
    return this.subscriptionManager.getSubscriberCount(ticker);
  }

  // Get price monitor instance for a ticker
  getPriceMonitor(ticker: string): PriceMonitor | undefined {
    return this.priceMonitors.get(ticker);
  }

  // Check if a ticker is being monitored
  isMonitoring(ticker: string): boolean {
    const monitor = this.priceMonitors.get(ticker);
    return monitor ? monitor.isPolling() : false;
  }

  // Cleanup all resources and shutdown service
  async destroy(): Promise<void> {
    logger.info('Shutting down browser orchestrator service...', 'BrowserOrchestratorService');
    
    // Stop all price monitors
    for (const [ticker, monitor] of this.priceMonitors) {
      monitor.stopPolling();
    }
    this.priceMonitors.clear();

    // Clear subscriptions
    this.subscriptionManager.clearAllSubscriptions();
    this.tickerCallbacks.clear();

    // Close all pages
    await this.pageManager.closeAllPages();

    logger.info('Browser orchestrator service shut down', 'BrowserOrchestratorService');
  }
}
