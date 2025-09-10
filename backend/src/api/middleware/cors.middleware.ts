import { corsConfig } from '../../config/cors.config';
import { logger } from '../../utils/logger.util';

// Apply CORS headers to allow cross-origin requests
export function corsMiddleware(req: any, res: any, next: Function): void {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', corsConfig.origin);
  res.setHeader('Access-Control-Allow-Methods', corsConfig.methods);
  res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders);
  res.setHeader('Access-Control-Max-Age', corsConfig.maxAge);

  if (corsConfig.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    if (!res.headersSent) {
      res.writeHead(corsConfig.optionsSuccessStatus);
      res.end();
    }
    return;
  }

  logger.debug('CORS headers applied', 'CorsMiddleware', { 
    origin: req.headers.origin,
    method: req.method 
  });

  next();
}

// Handle CORS-related errors
export function corsErrorHandler(error: any, req: any, res: any, next: Function): void {
  if (error && error.message && error.message.includes('CORS')) {
    logger.warn('CORS error occurred', 'CorsMiddleware', { 
      error: error.message,
      origin: req.headers.origin 
    });
    
    res.status(403).json({
      error: 'CORS policy violation',
      message: 'Request blocked by CORS policy',
      statusCode: 403,
      timestamp: Date.now()
    });
    return;
  }

  next(error);
}
