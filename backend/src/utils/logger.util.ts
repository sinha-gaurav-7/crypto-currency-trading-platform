// Log levels for application logging
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Structure for log entries
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, any>;
}

// Singleton logger class for application logging
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  }

  // Get singleton logger instance
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Check if message should be logged based on current level
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  // Format log message with timestamp and context
  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date().toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
    return `${timestamp} ${entry.level.toUpperCase()} ${context} ${entry.message}${metadata}`;
  }

  // Log error message
  public error(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage({ level: LogLevel.ERROR, message, timestamp: new Date().toISOString(), context, metadata }));
    }
  }

  // Log warning message
  public warn(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage({ level: LogLevel.WARN, message, timestamp: new Date().toISOString(), context, metadata }));
    }
  }

  // Log info message
  public info(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage({ level: LogLevel.INFO, message, timestamp: new Date().toISOString(), context, metadata }));
    }
  }

  // Log debug message
  public debug(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage({ level: LogLevel.DEBUG, message, timestamp: new Date().toISOString(), context, metadata }));
    }
  }

  // Change current log level
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

// Global logger instance
export const logger = Logger.getInstance();
