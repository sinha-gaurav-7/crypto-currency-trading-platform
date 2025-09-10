// Re-export ConnectRPC generated types
export type { 
  PriceUpdate, 
  AddTickerRequest, 
  RemoveTickerRequest,
  SubscribeRequest 
} from '../gen/proto/trading_pb';

// Core data structure for cryptocurrency tickers
export interface TickerData {
  ticker: string;
  price: string;
  lastUpdate: Date;
}

// Component props interfaces for React components
export interface AddTickerFormProps {
  tickers: TickerData[];
  onAddTicker: (ticker: string) => void;
}

export interface ConnectionStatusProps {
  isConnected: boolean;
}

export interface TickerCardProps {
  ticker: TickerData;
  onRemove: (ticker: string) => void;
}

export interface TickerListProps {
  tickers: TickerData[];
  onRemoveTicker: (ticker: string) => void;
}

// Service interfaces for API and streaming operations
export interface PriceStreamingService {
  subscribe: (ticker: string) => Promise<void>;
  unsubscribe: (ticker: string) => Promise<void>;
  isConnected: () => boolean;
}

export interface TradingApiService {
  addTicker: (request: { ticker: string }) => Promise<void>;
  removeTicker: (request: { ticker: string }) => Promise<void>;
  getTickers: () => Promise<TickerData[]>;
}

// Return type interfaces for custom React hooks
export interface UseAddTickerFormReturn {
  newTicker: string;
  setNewTicker: (value: string) => void;
  error: string;
  handleSubmit: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  clearError: () => void;
}

export interface UsePriceStreamReturn {
  isConnected: boolean;
  subscribe: (ticker: string) => Promise<void>;
  unsubscribe: (ticker: string) => Promise<void>;
}

export interface UseTickersReturn {
  tickers: TickerData[];
  addTicker: (ticker: string) => Promise<void>;
  removeTicker: (ticker: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Callback interfaces for event handling
export interface PriceStreamCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onPriceUpdate: (update: { ticker: string; price: string; timestamp: bigint }) => void;
  onError: (error: string) => void;
}
