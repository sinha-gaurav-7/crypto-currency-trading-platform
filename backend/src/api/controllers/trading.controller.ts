import { IncomingMessage, ServerResponse } from 'http';
import { TradingService } from '../../core/services/trading.service';
import { logger } from '../../utils/logger.util';
import { API_CONSTANTS } from '../../constants/api.constants';

// Trading controller for handling trading operations via HTTP
export class TradingController {
  private tradingService: TradingService;

  constructor(tradingService: TradingService) {
    this.tradingService = tradingService;
  }

  // Add a new ticker to monitoring
  async addTicker(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      let body = '';
      req.on('data', (chunk: Buffer) => body += chunk);
      
      req.on('end', async () => {
        try {
          const request = JSON.parse(body);
          await this.tradingService.addTicker(request);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({}));
          
          logger.info('Ticker added successfully', 'TradingController', { ticker: request.ticker });
        } catch (error) {
          logger.error('Failed to add ticker', 'TradingController', { error: error instanceof Error ? error.message : String(error) });
          
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
          }));
        }
      });
    } catch (error) {
      logger.error('Error processing add ticker request', 'TradingController', { error: error instanceof Error ? error.message : String(error) });
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Internal server error',
        timestamp: Date.now()
      }));
    }
  }

  // Remove a ticker from monitoring
  async removeTicker(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      let body = '';
      req.on('data', (chunk: Buffer) => body += chunk);
      
      req.on('end', async () => {
        try {
          const request = JSON.parse(body);
          await this.tradingService.removeTicker(request);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({}));
          
          logger.info('Ticker removed successfully', 'TradingController', { ticker: request.ticker });
        } catch (error) {
          logger.error('Failed to remove ticker', 'TradingController', { error: error instanceof Error ? error.message : String(error) });
          
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
          }));
        }
      });
    } catch (error) {
      logger.error('Error processing remove ticker request', 'TradingController', { error: error instanceof Error ? error.message : String(error) });
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Internal server error',
        timestamp: Date.now()
      }));
    }
  }

  // Stream real-time price updates
  async streamPrices(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      res.writeHead(200, API_CONSTANTS.STREAMING_HEADERS);

      // Start streaming
      const streamPromise = this.tradingService.streamPrices();
      const stream = await streamPromise;
      
      try {
        for await (const update of stream) {
          if (update && Object.keys(update).length > 0) {
            const data = JSON.stringify({ ...update, timestamp: Number(update.timestamp) }) + '\n';
            res.write(data);
          }
        }
      } catch (error) {
        logger.error('Streaming error', 'TradingController', { error: error instanceof Error ? error.message : String(error) });
      } finally {
        res.end();
      }
    } catch (error) {
      logger.error('Error starting price stream', 'TradingController', { error: error instanceof Error ? error.message : String(error) });
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Failed to start price stream',
        timestamp: Date.now()
      }));
    }
  }

  // Get current trading status
  async getStatus(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const status = await this.tradingService.getTradingStatus();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status, null, 2));
      
      logger.debug('Status requested', 'TradingController');
    } catch (error) {
      logger.error('Error getting status', 'TradingController', { error: error instanceof Error ? error.message : String(error) });
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Failed to get status',
        timestamp: Date.now()
      }));
    }
  }
}
