import { ISubscriptionManager, PriceUpdateCallback } from '../../core/interfaces/streaming.interface';
import { PriceUpdate } from '../../models/trading.models';
import { PriceData } from '../../models/browser.models';
import { logger } from '../../utils/logger.util';

// Manages ticker subscriptions and price update notifications
export class SubscriptionManager implements ISubscriptionManager {
  private subscriptions: Map<string, Set<PriceUpdateCallback>> = new Map();

  // Subscribe to price updates for a ticker
  async subscribe(ticker: string, callback: PriceUpdateCallback): Promise<void> {
    if (!this.subscriptions.has(ticker)) {
      this.subscriptions.set(ticker, new Set());
    }

    this.subscriptions.get(ticker)!.add(callback);
    logger.info(`Subscribed to ${ticker} prices`, 'SubscriptionManager');
  }

  // Unsubscribe from price updates for a ticker
  async unsubscribe(ticker: string, callback: PriceUpdateCallback): Promise<void> {
    const callbacks = this.subscriptions.get(ticker);
    if (callbacks) {
      callbacks.delete(callback);
      
      // If no more subscribers, remove the ticker entry
      if (callbacks.size === 0) {
        this.subscriptions.delete(ticker);
        logger.info(`No more subscribers for ${ticker}, removed from subscriptions`, 'SubscriptionManager');
      } else {
        logger.info(`Unsubscribed from ${ticker} prices`, 'SubscriptionManager');
      }
    }
  }

  // Notify all subscribers of price updates
  async notifySubscribers(ticker: string, update: PriceUpdate): Promise<void> {
    const callbacks = this.subscriptions.get(ticker);
    if (callbacks) {
      logger.debug(`Notifying ${callbacks.size} subscribers for ${ticker}: ${update.price}`, 'SubscriptionManager');
      
      callbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          logger.error(`Error in price callback for ${ticker}`, 'SubscriptionManager', { error: error instanceof Error ? error.message : String(error) });
        }
      });
    }
  }

  // Get number of subscribers for a ticker
  getSubscriberCount(ticker: string): number {
    return this.subscriptions.get(ticker)?.size || 0;
  }

  // Get list of all active tickers
  getActiveTickers(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  // Check if ticker has active subscribers
  hasSubscribers(ticker: string): boolean {
    return this.subscriptions.has(ticker) && this.subscriptions.get(ticker)!.size > 0;
  }

  // Get total subscriber count across all tickers
  getTotalSubscriberCount(): number {
    let total = 0;
    for (const callbacks of this.subscriptions.values()) {
      total += callbacks.size;
    }
    return total;
  }

  // Clear all subscriptions for a specific ticker
  clearSubscriptions(ticker: string): void {
    this.subscriptions.delete(ticker);
    logger.info(`Cleared all subscriptions for ${ticker}`, 'SubscriptionManager');
  }

  // Clear all subscriptions across all tickers
  clearAllSubscriptions(): void {
    this.subscriptions.clear();
    logger.info('Cleared all subscriptions', 'SubscriptionManager');
  }

  // Convert PriceData to PriceUpdate format
  convertPriceDataToUpdate(priceData: PriceData): PriceUpdate {
    return {
      ticker: priceData.ticker,
      price: priceData.price,
      timestamp: BigInt(priceData.timestamp),
    };
  }
}
