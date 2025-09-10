// Streaming service interface for managing real-time price updates
export interface IStreamingService {
  addClient(clientId: string): Promise<void>;
  removeClient(clientId: string): Promise<void>;
  broadcastUpdate(update: PriceUpdate): Promise<void>;
  getActiveClientCount(): number;
  isClientActive(clientId: string): boolean;
}

// Subscription management interface for ticker subscriptions
export interface ISubscriptionManager {
  subscribe(ticker: string, callback: PriceUpdateCallback): Promise<void>;
  unsubscribe(ticker: string, callback: PriceUpdateCallback): Promise<void>;
  notifySubscribers(ticker: string, update: PriceUpdate): Promise<void>;
  getSubscriberCount(ticker: string): number;
  getActiveTickers(): string[];
}

// Client management interface for handling client connections
export interface IClientManager {
  addClient(clientId: string, callback: (update: PriceUpdate) => void): Promise<void>;
  removeClient(clientId: string): Promise<void>;
  sendUpdate(clientId: string, update: PriceUpdate): Promise<void>;
  getActiveClients(): string[];
}

// Callback interface for price update notifications
export interface PriceUpdateCallback {
  (data: PriceUpdate): void;
}

// Price update data structure
export interface PriceUpdate {
  ticker: string;
  price: string;
  timestamp: bigint;
}
