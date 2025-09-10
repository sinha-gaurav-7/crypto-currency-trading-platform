// Price source interface for extracting prices from web elements
export interface IPriceSource {
  extractPrice(): Promise<string | null>;
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  isMonitoring(): boolean;
}

// Price extraction interface for processing price data
export interface IPriceExtractor {
  extractPriceFromElement(element: any): Promise<string | null>;
  validatePrice(price: string): boolean;
  cleanPriceText(text: string): string;
}

// Price monitoring interface for continuous price updates
export interface IPriceMonitor {
  startPolling(interval: number): void;
  stopPolling(): void;
  isPolling(): boolean;
  setPollingInterval(interval: number): void;
}
