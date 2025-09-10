import { IPriceMonitor } from '../../core/interfaces/price-source.interface';
import { PriceExtractor } from '../scraping/price-extractor';
import { PriceData } from '../../models/browser.models';
import { TRADING_CONSTANTS } from '../../constants/trading.constants';
import { logger } from '../../utils/logger.util';
import { AsyncUtil } from '../../utils/async.util';

// Monitors price changes for a specific ticker with periodic polling
export class PriceMonitor implements IPriceMonitor {
  private _isPolling = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private currentInterval: number = TRADING_CONSTANTS.POLLING_INTERVAL;
  private priceExtractor: PriceExtractor;
  private ticker: string;
  private onPriceUpdate: (priceData: PriceData) => void;
  private lastPrice: string | null = null;

  constructor(
    priceExtractor: PriceExtractor,
    ticker: string,
    onPriceUpdate: (priceData: PriceData) => void
  ) {
    this.priceExtractor = priceExtractor;
    this.ticker = ticker;
    this.onPriceUpdate = onPriceUpdate;
  }

  // Start periodic price monitoring
  startPolling(interval: number = TRADING_CONSTANTS.POLLING_INTERVAL): void {
    if (this._isPolling) {
      logger.warn(`Price monitoring already started for ${this.ticker}`, 'PriceMonitor');
      return;
    }

    this.currentInterval = interval;
    this._isPolling = true;

    logger.info(`Starting price monitoring for ${this.ticker}`, 'PriceMonitor');

    // Initial price fetch
    this.fetchInitialPrice();

    // Set up periodic polling
    this.pollInterval = setInterval(async () => {
      if (!this._isPolling) {
        this.stopPolling();
        return;
      }

      await this.pollPrice();
    }, this.currentInterval);

    logger.info(`Price monitoring started for ${this.ticker} with ${interval}ms interval`, 'PriceMonitor');
  }

  // Stop price monitoring
  stopPolling(): void {
    if (!this._isPolling) {
      return;
    }

    this._isPolling = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    logger.info(`Price monitoring stopped for ${this.ticker}`, 'PriceMonitor');
  }

  // Check if monitoring is active
  isPolling(): boolean {
    return this._isPolling;
  }

  // Change polling interval
  setPollingInterval(interval: number): void {
    if (this._isPolling) {
      // Restart polling with new interval
      this.stopPolling();
      this.currentInterval = interval;
      this.startPolling(interval);
    } else {
      this.currentInterval = interval;
    }
  }

  // Fetch initial price when monitoring starts
  private async fetchInitialPrice(): Promise<void> {
    try {
      logger.debug(`Fetching initial price for ${this.ticker}`, 'PriceMonitor');
      const priceData = await this.priceExtractor.extractPriceWithTimestamp();
      if (priceData) {
        priceData.ticker = this.ticker;
        this.lastPrice = priceData.price;
        logger.debug(`Initial price extracted for ${this.ticker}: ${priceData.price}`, 'PriceMonitor');
        this.onPriceUpdate(priceData);
        logger.debug(`Initial price for ${this.ticker}: ${priceData.price}`, 'PriceMonitor');
      } else {
        logger.warn(`No initial price data for ${this.ticker}`, 'PriceMonitor');
      }
    } catch (error) {
      logger.error(`Failed to fetch initial price for ${this.ticker}`, 'PriceMonitor', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // Poll for price updates periodically
  private async pollPrice(): Promise<void> {
    try {
      const priceData = await this.priceExtractor.extractPriceWithTimestamp();
      if (priceData) {
        priceData.ticker = this.ticker;
        
        // Only update if price has changed
        if (this.lastPrice !== priceData.price) {
          this.lastPrice = priceData.price;
          this.onPriceUpdate(priceData);
          logger.debug(`Price update for ${this.ticker}: ${priceData.price}`, 'PriceMonitor');
        }
      }
    } catch (error) {
      logger.error(`Failed to poll price for ${this.ticker}`, 'PriceMonitor', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // Get current cached price
  getCurrentPrice(): string | null {
    return this.lastPrice;
  }

  // Get ticker symbol being monitored
  getTicker(): string {
    return this.ticker;
  }

  // Get current polling interval
  getPollingInterval(): number {
    return this.currentInterval;
  }
}
