"use client";

import React from "react";
import { useAddTickerForm } from "../hooks/useAddTickerForm";
import { TickerData } from "../types/trading";

// Props interface for the AddTickerForm component
interface AddTickerFormProps {
  tickers: TickerData[];
  onAddTicker: (ticker: string) => void;
}

// Component for adding new cryptocurrency tickers to the trading dashboard
export const AddTickerForm: React.FC<AddTickerFormProps> = ({
  tickers,
  onAddTicker,
}) => {
  // Custom hook for form state and validation
  const {
    newTicker,
    setNewTicker,
    error,
    validationError,
    handleSubmit,
    handleKeyDown,
  } = useAddTickerForm(tickers, onAddTicker);

  return (
    <div className="add-ticker-form">
      <h3 className="form-title">Add Cryptocurrency Ticker</h3>
      <div className="form-input-group">
        <input
          type="text"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter ticker (e.g., BTCUSD, ETHUSD)"
          className={`ticker-input ${validationError ? "error" : ""}`}
        />
        <button
          onClick={handleSubmit}
          disabled={!newTicker.trim() || !!validationError}
          className="add-button"
        >
          Add Ticker
        </button>
      </div>

      {validationError && (
        <div className="validation-error">
          <span className="error-icon">⚠️</span>
          {validationError}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
