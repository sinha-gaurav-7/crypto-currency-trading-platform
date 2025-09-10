import { useState, useCallback } from 'react';
import { addTicker as addTickerApi } from '../services/tradingApi';
import { validateTicker, isTickerDuplicate } from '../utils/tickerUtils';
import { TickerData } from '../types/trading';
import { AddTickerRequest } from '../gen/proto/trading_pb';

// Custom hook for managing add ticker form state and validation
export const useAddTickerForm = (
  tickers: TickerData[],
  onAddTicker: (ticker: string) => void
) => {
  const [newTicker, setNewTicker] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Validate ticker input format and length
  const validateInput = useCallback((ticker: string) => {
    setValidationError('');
    
    if (!ticker.trim()) {
      return true; 
    }
    
    if (ticker.length < 2) {
      setValidationError('Ticker must be at least 2 characters long');
      return false;
    }
    
    if (ticker.length > 15) {
      setValidationError('Ticker must be 15 characters or less');
      return false;
    }
    
    if (!/^[A-Z0-9]+$/i.test(ticker)) {
      setValidationError('Ticker can only contain letters and numbers');
      return false;
    }
    
    return true;
  }, []);

  // Handle ticker input changes with real-time validation
  const handleTickerChange = useCallback((value: string) => {
    setNewTicker(value);
    setError(''); 
    setValidationError(''); 
    
    // Real-time validation
    if (value.trim()) {
      validateInput(value);
    }
  }, [validateInput]);

  // Submit ticker to API and add to local state
  const handleSubmit = useCallback(async () => {
    if (!newTicker.trim()) return;

    // Clear previous errors
    setError('');
    setValidationError('');

    // Immediate validation
    if (!validateInput(newTicker)) {
      return;
    }

    const tickerUpper = newTicker.trim().toUpperCase();

    // Check if ticker already exists
    if (isTickerDuplicate(tickers, tickerUpper)) {
      setError("Ticker already exists");
      return;
    }

    try {
      const request: AddTickerRequest = { ticker: tickerUpper };
      await addTickerApi(request);
      
      // Add ticker to local state
      onAddTicker(tickerUpper);
      setNewTicker('');
      console.log(`Added ticker: ${tickerUpper}`);
    } catch (error: any) {
      console.error("Error adding ticker:", error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to add ticker';
      
      if (error.message?.includes('not found') || error.message?.includes('not supported')) {
        errorMessage = 'Ticker not found or not supported';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out - please try again';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  }, [newTicker, tickers, onAddTicker, validateInput]);

  // Handle Enter key press for form submission
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  // Clear all error states
  const clearError = useCallback(() => {
    setError('');
    setValidationError('');
  }, []);

  return {
    newTicker,
    setNewTicker: handleTickerChange,
    error,
    validationError,
    handleSubmit,
    handleKeyDown,
    clearError,
  };
};
