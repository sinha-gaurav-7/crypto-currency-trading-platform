import { BaseError } from './base.error';

// Base streaming error for all real-time streaming issues
export class StreamingError extends BaseError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, true);
  }
}

// Error thrown when client connection fails
export class ClientConnectionError extends StreamingError {
  constructor(message: string = 'Failed to connect client') {
    super(message, 500);
  }
}

// Error thrown when stream creation fails
export class StreamCreationError extends StreamingError {
  constructor(message: string = 'Failed to create stream') {
    super(message, 500);
  }
}

// Error thrown when client disconnection fails
export class ClientDisconnectionError extends StreamingError {
  constructor(message: string = 'Failed to disconnect client') {
    super(message, 500);
  }
}
