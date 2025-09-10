"use client";

import React from "react";
import { ConnectionStatus } from "./ConnectionStatus";
import { AddTickerForm } from "./AddTickerForm";
import { TickerList } from "./TickerList";
import { useTickers } from "../hooks/useTickers";
import { usePriceStream } from "../hooks/usePriceStream";

// Main dashboard component for cryptocurrency price streaming and management
export const TradingDashboard: React.FC = () => {
  // Custom hooks for ticker management and price streaming
  const { tickers, addTicker, removeTicker, updateTickerPrice } = useTickers();
  const { isConnected, error: streamError } = usePriceStream(updateTickerPrice);

  return (
    <div className="trading-dashboard">
      <h1 className="dashboard-title">Crypto Price Streaming</h1>

      <ConnectionStatus isConnected={isConnected} />

      <AddTickerForm tickers={tickers} onAddTicker={addTicker} />

      <TickerList tickers={tickers} onRemoveTicker={removeTicker} />
    </div>
  );
};
