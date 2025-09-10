import { logger } from '../../utils/logger.util';

// Log incoming requests and response times
export function loggingMiddleware(req: any, res: any, next: Function): void {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);

  // Log incoming request
  logger.info('Incoming request', 'LoggingMiddleware', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding: any) {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', 'LoggingMiddleware', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
}

// Log request body content for debugging
export function requestBodyLoggingMiddleware(req: any, res: any, next: Function): void {
  if (req.body && Object.keys(req.body).length > 0) {
    logger.debug('Request body', 'LoggingMiddleware', {
      method: req.method,
      url: req.url,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }
  next();
}

// Log response body content for debugging
export function responseLoggingMiddleware(req: any, res: any, next: Function): void {
  const originalSend = res.send;
  
  res.send = function(body: any) {
    if (body && typeof body === 'object') {
      logger.debug('Response body', 'LoggingMiddleware', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        bodySize: JSON.stringify(body).length,
        timestamp: new Date().toISOString()
      });
    }
    
    originalSend.call(this, body);
  };

  next();
}
