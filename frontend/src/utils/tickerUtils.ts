import { TickerData } from '../types/trading';

// Validate and normalize ticker symbol format
export const validateTicker = (ticker: string): string => {
  return ticker.toUpperCase().trim();
};

// Check if ticker already exists in the list
export const isTickerDuplicate = (tickers: TickerData[], newTicker: string): boolean => {
  return tickers.some((t) => t.ticker === newTicker);
};

// Sort tickers alphabetically by symbol
export const sortTickersAlphabetically = (tickers: TickerData[]): TickerData[] => {
  return [...tickers].sort((a, b) => a.ticker.localeCompare(b.ticker));
};

// Create new ticker with initial loading state
export const createNewTicker = (ticker: string): TickerData => {
  return {
    ticker,
    price: "Loading...",
    lastUpdate: new Date(),
  };
};
