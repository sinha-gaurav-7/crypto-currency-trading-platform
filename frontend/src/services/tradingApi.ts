import { AddTickerRequest, RemoveTickerRequest } from '../gen/proto/trading_pb';
import { API_BASE_URL } from '../constants/api';

// Add new cryptocurrency ticker to the trading system
export const addTicker = async (request: AddTickerRequest): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}/trading.v1.TradingService/AddTicker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to add ticker: ${response.statusText}`);
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    throw error;
  }
};

// Remove cryptocurrency ticker from the trading system
export const removeTicker = async (request: RemoveTickerRequest): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}/trading.v1.TradingService/RemoveTicker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to remove ticker: ${response.statusText}`);
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    throw error;
  }
};
