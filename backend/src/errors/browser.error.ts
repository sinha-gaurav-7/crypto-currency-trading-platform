import { BaseError } from './base.error';

// Base browser error for all browser-related issues
export class BrowserError extends BaseError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, true);
  }
}

// Error thrown when browser fails to initialize
export class BrowserInitializationError extends BrowserError {
  constructor(message: string = 'Failed to initialize browser') {
    super(message, 500);
  }
}

// Error thrown when page creation fails
export class PageCreationError extends BrowserError {
  constructor(message: string = 'Failed to create page') {
    super(message, 500);
  }
}

// Error thrown when page navigation fails
export class NavigationError extends BrowserError {
  constructor(message: string = 'Failed to navigate to page') {
    super(message, 500);
  }
}
