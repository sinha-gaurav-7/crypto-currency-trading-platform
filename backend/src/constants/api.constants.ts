// API configuration constants and endpoints
export const API_CONSTANTS = {
  DEFAULT_PORT: 8080,                                                      // Default server port
  CORS_ORIGIN: 'http://localhost:3000',                                    // Default CORS origin
  CORS_METHODS: 'GET, POST, OPTIONS',                                      // Allowed HTTP methods
  CORS_HEADERS: 'Content-Type, Connect-Protocol-Version, Connect-Timeout-Ms', // Allowed headers
  CONNECTRPC_ENDPOINTS: {                                                  // ConnectRPC service endpoints
    ADD_TICKER: '/trading.v1.TradingService/AddTicker',                    // Add ticker endpoint
    REMOVE_TICKER: '/trading.v1.TradingService/RemoveTicker',              // Remove ticker endpoint
    STREAM_PRICES: '/trading.v1.TradingService/StreamPrices',              // Stream prices endpoint
  },
  STATUS_ENDPOINT: '/status',                                              // Status check endpoint
  HEALTH_ENDPOINT: '/health',                                              // Health check endpoint
  STREAMING_HEADERS: {                                                     // Headers for streaming responses
    'Content-Type': 'application/json',
    'Transfer-Encoding': 'chunked',
    'Connection': 'keep-alive',
  },
} as const;

// Standard API error messages
export const API_ERRORS = {
  INVALID_REQUEST: 'Invalid request',                                       // Bad request error
  INTERNAL_SERVER_ERROR: 'Internal server error',                           // Server error
  METHOD_NOT_ALLOWED: 'Method not allowed',                                // HTTP method error
  ENDPOINT_NOT_FOUND: 'Endpoint not found',                                // 404 error
  STREAMING_ERROR: 'Streaming error occurred',                             // Streaming error
} as const;
