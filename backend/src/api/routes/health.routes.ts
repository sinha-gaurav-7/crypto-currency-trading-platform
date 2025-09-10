import { IncomingMessage, ServerResponse } from 'http';
import { HealthController } from '../controllers/health.controller';
import { API_CONSTANTS } from '../../constants/api.constants';
import { logger } from '../../utils/logger.util';

// Routes for health check endpoints
export class HealthRoutes {
  private healthController: HealthController;

  constructor(healthController: HealthController) {
    this.healthController = healthController;
  }

  // Route incoming requests to appropriate health endpoints
  handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url || '', `http://localhost:8080`);
    const pathname = url.pathname;
    const method = req.method || 'GET';

    try {
      // Health check endpoint
      if (pathname === API_CONSTANTS.HEALTH_ENDPOINT && method === 'GET') {
        this.healthController.getHealth(req, res);
        return;
      }

      // If no route matches, return 404
      this.handleNotFound(req, res);
    } catch (error) {
      logger.error('Error in health routes', 'HealthRoutes', { 
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

  // Return list of supported health endpoints
  getSupportedEndpoints(): string[] {
    return [
      `GET ${API_CONSTANTS.HEALTH_ENDPOINT}`,
    ];
  }
}
