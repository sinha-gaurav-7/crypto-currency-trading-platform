import { logger } from '../../utils/logger.util';
import { BaseError } from '../../errors/base.error';
import { ErrorResponse } from '../../models/api.models';

// Global error handler for unhandled exceptions
export function errorMiddleware(error: any, req: any, res: any, next: Function): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let errorType = 'InternalError';

  // Handle known error types
  if (error instanceof BaseError) {
    statusCode = error.statusCode;
    message = error.message;
    errorType = error.constructor.name;
  } else if (error instanceof Error) {
    message = error.message;
    errorType = error.constructor.name;
  } else if (typeof error === 'string') {
    message = error;
    errorType = 'StringError';
  }

  // Log the error
  logger.error('Unhandled error occurred', 'ErrorMiddleware', {
    error: message,
    type: errorType,
    statusCode,
    url: req.url,
    method: req.method,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Create error response
  const errorResponse: ErrorResponse = {
    error: errorType,
    message,
    statusCode,
    timestamp: Date.now()
  };

  // Send error response using Node.js HTTP methods
  if (!res.headersSent) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorResponse));
  }
}

// Handle 404 Not Found errors
export function notFoundMiddleware(req: any, res: any): void {
  const errorResponse: ErrorResponse = {
    error: 'NotFound',
    message: `Endpoint ${req.method} ${req.url} not found`,
    statusCode: 404,
    timestamp: Date.now()
  };

  logger.warn('Endpoint not found', 'ErrorMiddleware', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  if (!res.headersSent) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorResponse));
  }
}

// Handle 405 Method Not Allowed errors
export function methodNotAllowedMiddleware(req: any, res: any): void {
  const errorResponse: ErrorResponse = {
    error: 'MethodNotAllowed',
    message: `Method ${req.method} not allowed for ${req.url}`,
    statusCode: 405,
    timestamp: Date.now()
  };

  logger.warn('Method not allowed', 'ErrorMiddleware', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  if (!res.headersSent) {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorResponse));
  }
}
