import { API_CONSTANTS } from '../constants/api.constants';

// CORS configuration for cross-origin request handling
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || API_CONSTANTS.CORS_ORIGIN,            // Allowed origin domains
  methods: process.env.CORS_METHODS || API_CONSTANTS.CORS_METHODS,          // Allowed HTTP methods
  allowedHeaders: process.env.CORS_HEADERS || API_CONSTANTS.CORS_HEADERS,   // Allowed request headers
  credentials: process.env.CORS_CREDENTIALS === 'true',                     // Allow credentials (cookies, auth)
  maxAge: parseInt(process.env.CORS_MAX_AGE || '86400'),                   // Preflight cache time (24 hours)
  preflightContinue: false,                                                // Don't continue on preflight
  optionsSuccessStatus: 200,                                               // Success status for OPTIONS
} as const;
