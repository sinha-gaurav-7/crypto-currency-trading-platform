import { API_CONSTANTS } from '../constants/api.constants';

// Application configuration with environment variable fallbacks
export const appConfig = {
  port: process.env.PORT || API_CONSTANTS.DEFAULT_PORT,                    // Server port
  environment: process.env.NODE_ENV || 'development',                      // Runtime environment
  logLevel: process.env.LOG_LEVEL || 'info',                              // Logging verbosity
  enableMetrics: process.env.ENABLE_METRICS === 'true',                   // Enable metrics collection
  enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false',       // Enable health endpoints
  gracefulShutdownTimeout: parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT || '30000'), // Shutdown timeout in ms
} as const;
