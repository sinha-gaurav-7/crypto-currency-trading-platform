"use client";

import React from "react";
import { TickerData } from "../types/trading";
import { formatTickerCount } from "../utils/formatUtils";
import { TickerCard } from "./TickerCard";

// Props interface for ticker list display
interface TickerListProps {
  tickers: TickerData[];
  onRemoveTicker: (ticker: string) => void;
}

// Component to display list of cryptocurrency tickers with grid layout
export const TickerList: React.FC<TickerListProps> = ({
  tickers,
  onRemoveTicker,
}) => {
  return (
    <div className="ticker-list">
      <h3 className="ticker-list-title">{formatTickerCount(tickers.length)}</h3>

      {tickers.length === 0 ? (
        <p className="empty-tickers-message">
          No tickers added yet. Add a ticker above to start streaming prices.
        </p>
      ) : (
        <div className="ticker-grid">
          {tickers.map((ticker) => (
            <TickerCard
              key={ticker.ticker}
              ticker={ticker}
              onRemove={onRemoveTicker}
            />
          ))}
        </div>
      )}
    </div>
  );
};
