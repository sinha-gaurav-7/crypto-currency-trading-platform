import { useState, useCallback } from 'react';
import { TickerData } from '../types/trading';
import { PriceUpdate } from '../gen/proto/trading_pb';
import { sortTickersAlphabetically, createNewTicker } from '../utils/tickerUtils';

// Custom hook for managing cryptocurrency ticker state and operations
export const useTickers = () => {
  const [tickers, setTickers] = useState<TickerData[]>([]);

  // Add new ticker to the list and maintain alphabetical order
  const addTicker = useCallback((ticker: string) => {
    const newTicker = createNewTicker(ticker);
    setTickers(prev => sortTickersAlphabetically([...prev, newTicker]));
  }, []);

  // Remove ticker from the list by symbol
  const removeTicker = useCallback((ticker: string) => {
    setTickers(prev => prev.filter(t => t.ticker !== ticker));
  }, []);

  // Update ticker price and timestamp, maintaining alphabetical order
  const updateTickerPrice = useCallback((update: PriceUpdate) => {
    setTickers(prev => {
      const updated = prev.map(ticker =>
        ticker.ticker === update.ticker
          ? { ...ticker, price: update.price, lastUpdate: new Date() }
          : ticker
      );
      return sortTickersAlphabetically(updated);
    });
  }, []);

  return {
    tickers,
    addTicker,
    removeTicker,
    updateTickerPrice,
  };
};
