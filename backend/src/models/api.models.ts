// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Real-time streaming price update response
export interface StreamingResponse {
  ticker: string;
  price: string;
  timestamp: number;
}

// Health check endpoint response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: number;
  uptime: number;
  services: {
    trading: boolean;
    browser: boolean;
    streaming: boolean;
  };
}

// Standard error response format
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: number;
}
