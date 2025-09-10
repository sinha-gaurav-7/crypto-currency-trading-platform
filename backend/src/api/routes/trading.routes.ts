import { IncomingMessage, ServerResponse } from 'http';
import { TradingController } from '../controllers/trading.controller';
import { API_CONSTANTS } from '../../constants/api.constants';
import { logger } from '../../utils/logger.util';

// Routes for trading operations and ConnectRPC endpoints
export class TradingRoutes {
  private tradingController: TradingController;

  constructor(tradingController: TradingController) {
    this.tradingController = tradingController;
  }

  // Route trading requests to appropriate controller methods
  handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url || '', `http://localhost:8080`);
    const pathname = url.pathname;
    const method = req.method || 'GET';

    try {
      // Handle ConnectRPC service endpoints
      if (pathname === API_CONSTANTS.CONNECTRPC_ENDPOINTS.ADD_TICKER && method === 'POST') {
        this.tradingController.addTicker(req, res);
        return;
      }

      if (pathname === API_CONSTANTS.CONNECTRPC_ENDPOINTS.REMOVE_TICKER && method === 'POST') {
        this.tradingController.removeTicker(req, res);
        return;
      }

      if (pathname === API_CONSTANTS.CONNECTRPC_ENDPOINTS.STREAM_PRICES && method === 'POST') {
        this.tradingController.streamPrices(req, res);
        return;
      }

      if (pathname === API_CONSTANTS.STATUS_ENDPOINT && method === 'GET') {
        this.tradingController.getStatus(req, res);
        return;
      }

      // If no route matches, return 404
      this.handleNotFound(req, res);
    } catch (error) {
      logger.error('Error in trading routes', 'TradingRoutes', { 
        error: error instanceof Error ? error.message : String(error),
        pathname,
        method 
      });
      
      this.handleError(req, res, error);
    }
  }

  // Handle 404 Not Found responses
  private handleNotFound(req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Endpoint not found',
      message: `Endpoint ${req.method} ${req.url} not found`,
      statusCode: 404,
      timestamp: Date.now()
    }));
  }

  // Handle internal server errors
  private handleError(req: IncomingMessage, res: ServerResponse, error: any): void {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500,
      timestamp: Date.now()
    }));
  }

  // Return list of supported trading endpoints
  getSupportedEndpoints(): string[] {
    return [
      `POST ${API_CONSTANTS.CONNECTRPC_ENDPOINTS.ADD_TICKER}`,
      `POST ${API_CONSTANTS.CONNECTRPC_ENDPOINTS.REMOVE_TICKER}`,
      `POST ${API_CONSTANTS.CONNECTRPC_ENDPOINTS.STREAM_PRICES}`,
      `GET ${API_CONSTANTS.STATUS_ENDPOINT}`,
    ];
  }
}
