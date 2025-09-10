import { 
  AddTickerRequest, 
  RemoveTickerRequest, 
  Empty, 
  TradingStatus,
  TickerInfo,
  TickerList,
  PriceUpdate
} from '../../models/trading.models';
import { BrowserOrchestratorService } from './browser-orchestrator.service';
import { PriceStreamingService } from './price-streaming.service';
import { PriceData } from '../../models/browser.models';
import { logger } from '../../utils/logger.util';
import { ValidationUtil } from '../../utils/validation.util';
import { TRADING_CONSTANTS } from '../../constants/trading.constants';

// Core trading service for managing ticker subscriptions and price streaming
export class TradingService {
  private browserOrchestrator: BrowserOrchestratorService;
  private priceStreaming: PriceStreamingService;
  private activeTickers: Set<string> = new Set();
  private tickerCallbacks: Map<string, (priceData: PriceData) => void> = new Map();

  constructor(browserOrchestrator: BrowserOrchestratorService, priceStreaming: PriceStreamingService) {
    this.browserOrchestrator = browserOrchestrator;
    this.priceStreaming = priceStreaming;
  }

  // Add a new ticker for price monitoring
  async addTicker(request: AddTickerRequest): Promise<Empty> {
    const { ticker } = request;
    
    logger.info(`Adding ticker: ${ticker}`, 'TradingService');
    
    try {
      // Validate request - ensure ticker is safe for URL construction
      const validation = ValidationUtil.validateAddTickerRequest(request);
      if (!validation.isValid) {
        throw new Error(`Ticker validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if ticker already exists
      if (this.activeTickers.has(ticker)) {
        throw new Error(`Ticker ${ticker} is already being monitored`);
      }

      // Check maximum ticker limit
      if (this.activeTickers.size >= TRADING_CONSTANTS.MAX_ACTIVE_TICKERS) {
        throw new Error(`Maximum number of active tickers (${TRADING_CONSTANTS.MAX_ACTIVE_TICKERS}) reached`);
      }

      // Quick validation for common invalid patterns to fail fast
      if (ticker.length < 2) {
        throw new Error(`Ticker ${ticker} is too short - must be at least 2 characters`);
      }
      
      if (ticker.length > 15) {
        throw new Error(`Ticker ${ticker} is too long - must be 15 characters or less`);
      }
      
      if (!/^[A-Z0-9]+$/.test(ticker)) {
        throw new Error(`Ticker ${ticker} contains invalid characters - only letters and numbers allowed`);
      }

      // Create a callback function for this ticker
      const callback = (priceData: PriceData) => {
        // Notify all streaming clients about this price update
        this.notifyStreamingClients({
          ticker: priceData.ticker,
          price: priceData.price,
          timestamp: BigInt(priceData.timestamp)
        });
      };
      
      // Store the callback for later removal
      this.tickerCallbacks.set(ticker, callback);
      
      // Subscribe to price updates from browser orchestrator
      await this.browserOrchestrator.subscribeToPrices(ticker, callback);
      
      // Add to active tickers
      this.activeTickers.add(ticker);
      
      logger.info(`Successfully added ticker: ${ticker}`, 'TradingService');
      return {};
    } catch (error) {
      logger.error(`Failed to add ticker ${ticker}`, 'TradingService', { error: error instanceof Error ? error.message : String(error) });
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not add ticker ${ticker}: ${errorMessage}`);
    }
  }

  // Remove a ticker from price monitoring
  async removeTicker(request: RemoveTickerRequest): Promise<Empty> {
    const { ticker } = request;
    
    logger.info(`Removing ticker: ${ticker}`, 'TradingService');
    
    try {
      // Validate request
      const validation = ValidationUtil.validateRemoveTickerRequest(request);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if ticker exists
      if (!this.activeTickers.has(ticker)) {
        throw new Error(`Ticker ${ticker} is not being monitored`);
      }

      // Get the stored callback for this ticker
      const callback = this.tickerCallbacks.get(ticker);
      if (callback) {
        // Remove from browser orchestrator monitoring
        await this.browserOrchestrator.unsubscribeFromPrices(ticker, callback);
        this.tickerCallbacks.delete(ticker);
      }
      
      // Remove from active tickers
      this.activeTickers.delete(ticker);
      
      logger.info(`Successfully removed ticker: ${ticker}`, 'TradingService');
      return {};
    } catch (error) {
      logger.error(`Failed to remove ticker ${ticker}`, 'TradingService', { error: error instanceof Error ? error.message : String(error) });
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not remove ticker ${ticker}: ${errorMessage}`);
    }
  }

  // Get current trading service status
  async getTradingStatus(): Promise<TradingStatus> {
    const activeStreams = this.priceStreaming.getActiveClientCount();
    
    return {
      activeTickers: this.activeTickers.size,
      activeStreams,
      tickers: Array.from(this.activeTickers)
    };
  }

  // Get information about a specific ticker
  async getTickerInfo(ticker: string): Promise<TickerInfo> {
    const isActive = this.activeTickers.has(ticker);
    const subscriberCount = isActive ? 1 : 0; // Simplified for now
    
    return {
      ticker,
      isActive,
      subscriberCount,
      lastUpdate: undefined // TODO: Implement last update tracking
    };
  }

  // Get list of all active tickers
  async getActiveTickers(): Promise<TickerList> {
    return {
      tickers: Array.from(this.activeTickers)
    };
  }

  // Stream real-time price updates to clients
  async streamPrices(): Promise<AsyncGenerator<any, void, unknown>> {
    const clientId = Math.random().toString(36).substring(2, 15);
    logger.info(`New client connected for price streaming: ${clientId}`, 'TradingService');
    
    // Add client to streaming service
    await this.priceStreaming.addClient(clientId);
    
    try {
      // Send initial prices for all active tickers
      const activeTickers = this.browserOrchestrator.getActiveTickers();
      logger.info(`Sending initial data for ${activeTickers.length} active tickers to client ${clientId}`, 'TradingService');

      // Create an async generator that yields price updates
      return (async function* (self: TradingService) {
        try {
          // Send initial status
          yield {
            type: 'status',
            message: 'Connected to price streaming service',
            activeTickers: activeTickers.length,
            timestamp: Date.now()
          };

          // Keep the stream alive and wait for price updates
          while (true) {
            // Wait a bit before checking for updates
            await new Promise(resolve => setTimeout(resolve, 2000)); // Match polling interval
            
            // Check if client is still active
            if (!self.priceStreaming.isClientActive(clientId)) {
              break;
            }
            
            // Check if there are any active tickers and send their current prices
            const activeTickers = self.browserOrchestrator.getActiveTickers();
            if (activeTickers.length > 0) {
              // Send current prices for active tickers
              for (const ticker of activeTickers) {
                // Get the current price from the PriceMonitor
                const currentPrice = self.browserOrchestrator.getCurrentPrice(ticker);
                if (currentPrice) {
                  yield {
                    type: 'price_update',
                    ticker,
                    price: currentPrice,
                    timestamp: Date.now()
                  };
                } else {
                  // Only show loading if we don't have a price yet
                  yield {
                    type: 'price_update',
                    ticker,
                    price: '$Loading...',
                    timestamp: Date.now()
                  };
                }
              }
            }
            
            // Yield a heartbeat to keep connection alive
            yield {
              type: 'heartbeat',
              timestamp: Date.now()
            };
          }
        } finally {
          // Cleanup when client disconnects
          await self.priceStreaming.removeClient(clientId);
          logger.info(`Client ${clientId} disconnected`, 'TradingService');
        }
      })(this);
    } catch (error) {
      logger.error(`Streaming error for client ${clientId}`, 'TradingService', { error: error instanceof Error ? error.message : String(error) });
      
      // Return error generator
      return (async function* () {
        yield {
          type: 'error',
          message: 'Failed to establish streaming connection',
          error: error instanceof Error ? error.message : String(error)
        };
      })();
    }
  }

  // Notify all streaming clients of price updates
  private notifyStreamingClients(update: any): void {
    try {
      // Format the update properly
      const formattedUpdate = {
        ticker: update.ticker,
        price: update.price,
        timestamp: update.timestamp || BigInt(Date.now())
      };
      
      logger.debug(`Broadcasting price update: ${formattedUpdate.ticker} = ${formattedUpdate.price}`, 'TradingService');
      
      // Broadcast update to all streaming clients
      this.priceStreaming.broadcastUpdate(formattedUpdate);
    } catch (error) {
      logger.error('Failed to notify streaming clients', 'TradingService', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // Check if a ticker is currently active
  isTickerActive(ticker: string): boolean {
    return this.activeTickers.has(ticker);
  }

  // Get total count of active tickers
  getTickerCount(): number {
    return this.activeTickers.size;
  }

  // Cleanup all resources and shutdown service
  async shutdown(): Promise<void> {
    logger.info('Shutting down trading service...', 'TradingService');
    
    // Clear active tickers
    this.activeTickers.clear();
    
    // Shutdown browser orchestrator
    await this.browserOrchestrator.destroy();
    
    // Shutdown price streaming
    await this.priceStreaming.destroy();
    
    logger.info('Trading service shut down', 'TradingService');
  }
}
