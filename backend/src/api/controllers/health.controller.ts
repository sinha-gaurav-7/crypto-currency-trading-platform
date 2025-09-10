import { IncomingMessage, ServerResponse } from 'http';
import { logger } from '../../utils/logger.util';
import { HealthCheckResponse } from '../../models/api.models';

// Health check controller for monitoring system status 
export class HealthController {
// Service start time for uptime calculation
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

// Main health check endpoint - returns system status 
  async getHealth(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const uptime = Date.now() - this.startTime;
      
      const healthResponse: HealthCheckResponse = {
        status: 'healthy',
        timestamp: Date.now(),
        uptime,
        services: {
          trading: true,      // Trading service
          browser: true,      // Browser automation
          streaming: true,    // Price streaming
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthResponse, null, 2));
      
      logger.debug('Health check requested', 'HealthController');
    } catch (error) {
      logger.error('Error getting health status', 'HealthController', { error: error instanceof Error ? error.message : String(error) });
      
      const healthResponse: HealthCheckResponse = {
        status: 'unhealthy',
        timestamp: Date.now(),
        uptime: Date.now() - this.startTime,
        services: {
          trading: false,     // All services unhealthy on error
          browser: false,
          streaming: false,
        }
      };

      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthResponse, null, 2));
    }
  }
}
