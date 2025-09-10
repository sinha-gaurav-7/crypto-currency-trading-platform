import { ValidationUtil } from '../../utils/validation.util';
import { logger } from '../../utils/logger.util';
import { ErrorResponse } from '../../models/api.models';

// Validate add ticker request body
export function validateAddTickerRequest(req: any, res: any, next: Function): void {
  try {
    const validation = ValidationUtil.validateAddTickerRequest(req.body);
    
    if (!validation.isValid) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: `Validation failed: ${validation.errors.join(', ')}`,
        statusCode: 400,
        timestamp: Date.now()
      };

      logger.warn('Add ticker validation failed', 'ValidationMiddleware', {
        body: req.body,
        errors: validation.errors,
        timestamp: new Date().toISOString()
      });

      res.status(400).json(errorResponse);
      return;
    }

    logger.debug('Add ticker request validated successfully', 'ValidationMiddleware');
    next();
  } catch (error) {
    logger.error('Validation middleware error', 'ValidationMiddleware', { error: error instanceof Error ? error.message : String(error) });
    
    const errorResponse: ErrorResponse = {
      error: 'ValidationError',
      message: 'Validation processing error',
      statusCode: 500,
      timestamp: Date.now()
    };

    res.status(500).json(errorResponse);
  }
}

// Validate remove ticker request body
export function validateRemoveTickerRequest(req: any, res: any, next: Function): void {
  try {
    const validation = ValidationUtil.validateRemoveTickerRequest(req.body);
    
    if (!validation.isValid) {
      const errorResponse: ErrorResponse = {
        error: 'ValidationError',
        message: `Validation failed: ${validation.errors.join(', ')}`,
        statusCode: 400,
        timestamp: Date.now()
      };

      logger.warn('Remove ticker validation failed', 'ValidationMiddleware', {
        body: req.body,
        errors: validation.errors,
        timestamp: new Date().toISOString()
      });

      res.status(400).json(errorResponse);
      return;
    }

    logger.debug('Remove ticker request validated successfully', 'ValidationMiddleware');
    next();
  } catch (error) {
    logger.error('Validation middleware error', 'ValidationMiddleware', { error: error instanceof Error ? error.message : String(error) });
    
    const errorResponse: ErrorResponse = {
      error: 'ValidationError',
      message: 'Validation processing error',
      statusCode: 500,
      timestamp: Date.now()
    };

    res.status(500).json(errorResponse);
  }
}

// Validate HTTP method against allowed methods
export function validateHttpMethod(allowedMethods: string[]): (req: any, res: any, next: Function) => void {
  return (req: any, res: any, next: Function): void => {
    if (!ValidationUtil.validateHttpMethod(req.method, allowedMethods)) {
      const errorResponse: ErrorResponse = {
        error: 'MethodNotAllowed',
        message: `Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
        statusCode: 405,
        timestamp: Date.now()
      };

      logger.warn('HTTP method not allowed', 'ValidationMiddleware', {
        method: req.method,
        allowedMethods,
        url: req.url,
        timestamp: new Date().toISOString()
      });

      res.status(405).json(errorResponse);
      return;
    }

    next();
  };
}

// Sanitize request body strings for security
export function sanitizeRequestBody(req: any, res: any, next: Function): void {
  if (req.body && typeof req.body === 'object') {
    // Sanitize string fields
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = ValidationUtil.sanitizeString(req.body[key]);
      }
    });

    logger.debug('Request body sanitized', 'ValidationMiddleware');
  }

  next();
}
