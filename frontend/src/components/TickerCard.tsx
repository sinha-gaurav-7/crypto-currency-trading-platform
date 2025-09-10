"use client";

import React from "react";
import { TickerData } from "../types/trading";
import { formatPrice, formatTime } from "../utils/formatUtils";
import { removeTicker } from "../services/tradingApi";
import { RemoveTickerRequest } from "../gen/proto/trading_pb";

// Props interface for individual ticker display
interface TickerCardProps {
  ticker: TickerData;
  onRemove: (ticker: string) => void;
}

// Component to display individual cryptocurrency ticker with price and remove functionality
export const TickerCard: React.FC<TickerCardProps> = ({ ticker, onRemove }) => {
  // Handle ticker removal from the trading dashboard
  const handleRemove = async () => {
    try {
      const request: RemoveTickerRequest = { ticker: ticker.ticker };
      await removeTicker(request);
      onRemove(ticker.ticker);
      console.log(`Removed ticker: ${ticker.ticker}`);
    } catch (error) {
      console.error("Error removing ticker:", error);
    }
  };

  return (
    <div className="ticker-card">
      <div className="ticker-info">
        <h4 className="ticker-symbol">{ticker.ticker}</h4>
        <p
          className={`ticker-price ${
            ticker.price === "Loading..." ? "loading" : "loaded"
          }`}
        >
          {formatPrice(ticker.price)}
        </p>
        <p className="ticker-timestamp">
          Last updated: {formatTime(ticker.lastUpdate)}
        </p>
      </div>

      <button className="remove-button" onClick={handleRemove}>
        Remove
      </button>
    </div>
  );
};
