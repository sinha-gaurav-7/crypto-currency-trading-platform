import { IncomingMessage, ServerResponse } from 'http';
import { TradingRoutes } from './trading.routes';
import { HealthRoutes } from './health.routes';
import { logger } from '../../utils/logger.util';

// Main router that directs requests to appropriate handlers
export class Routes {
  private tradingRoutes: TradingRoutes;
  private healthRoutes: HealthRoutes;

  constructor(tradingRoutes: TradingRoutes, healthRoutes: HealthRoutes) {
    this.tradingRoutes = tradingRoutes;
    this.healthRoutes = healthRoutes;
  }

  // Route incoming requests based on URL path
  handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url || '', `http://localhost:8080`);
    const pathname = url.pathname;

    try {
      // Route to appropriate handler based on path
      if (pathname.startsWith('/trading.v1.TradingService') || pathname === '/status') {
        this.tradingRoutes.handleRequest(req, res);
        return;
      }

      if (pathname.startsWith('/health')) {
        this.healthRoutes.handleRequest(req, res);
        return;
      }

      // Default endpoint
      if (pathname === '/' || pathname === '') {
        this.handleDefaultEndpoint(req, res);
        return;
      }

      // If no route matches, return 404
      this.handleNotFound(req, res);
    } catch (error) {
      logger.error('Error in main routes', 'Routes', { 
        error: error instanceof Error ? error.message : String(error),
        pathname,
        method: req.method 
      });
      
      this.handleError(req, res, error);
    }
  }

  // Handle root endpoint with server info
  private handleDefaultEndpoint(req: IncomingMessage, res: ServerResponse): void {
    const port = process.env.PORT || 8080;
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Backend server running on port ${port}\nConnectRPC endpoints available\nStatus: /status\nHealth: /health`);
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

  // Return list of all supported endpoints
  getAllSupportedEndpoints(): string[] {
    return [
      ...this.tradingRoutes.getSupportedEndpoints(),
      ...this.healthRoutes.getSupportedEndpoints(),
      'GET /',
    ];
  }
}
