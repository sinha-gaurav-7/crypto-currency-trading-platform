import { useState, useEffect, useRef } from 'react';
import { PriceStreamService } from '../services/priceStream';
import { PriceUpdate } from '../gen/proto/trading_pb';

// Custom hook for managing real-time price streaming connection
export const usePriceStream = (onPriceUpdate: (update: PriceUpdate) => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const streamServiceRef = useRef<PriceStreamService | null>(null);

  // Initialize price streaming service and manage connection lifecycle
  useEffect(() => {
    const streamService = new PriceStreamService();
    streamServiceRef.current = streamService;

    // Setup connection event callbacks
    const callbacks = {
      onConnect: () => {
        setIsConnected(true);
        setError('');
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onPriceUpdate,
      onError: (errorMessage: string) => {
        setError(errorMessage);
      },
    };

    streamService.connect(callbacks);

    // Cleanup on unmount
    return () => {
      streamService.disconnect();
    };
  }, [onPriceUpdate]);

  return {
    isConnected,
    error,
  };
};
