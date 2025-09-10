import { PriceUpdate } from './trading.models';

// Individual streaming client information
export interface StreamingClient {
  id: string;
  callback: (update: PriceUpdate) => void;
  isActive: boolean;
  connectedAt: number;
  lastActivity: number;
}

// Real-time stream update data
export interface StreamUpdate {
  ticker: string;
  price: string;
  timestamp: bigint;
  clientId?: string;
}

// Client connection/disconnection event
export interface ClientConnection {
  clientId: string;
  status: 'connected' | 'disconnected' | 'error';
  message?: string;
  timestamp: number;
}

// Streaming service performance metrics
export interface StreamMetrics {
  activeClients: number;
  totalUpdates: number;
  lastUpdate: number;
  tickerCount: number;
}
