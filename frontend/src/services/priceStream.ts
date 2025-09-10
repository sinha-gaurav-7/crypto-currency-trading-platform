import { PriceUpdate, SubscribeRequest } from '../gen/proto/trading_pb';
import { API_BASE_URL } from '../constants/api';
import { PriceStreamCallbacks } from '../types/trading';

// Service for managing real-time price streaming connection
export class PriceStreamService {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isSubscribed = false;
  private retryTimeout: NodeJS.Timeout | null = null;

  // Connect to price streaming endpoint and start reading updates
  async connect(callbacks: PriceStreamCallbacks): Promise<void> {
    try {
      console.log("Connecting to price stream...");

      const response = await fetch(`${API_BASE_URL}/trading.v1.TradingService/StreamPrices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({} as SubscribeRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to price stream");
      }

      callbacks.onConnect();
      this.reader = response.body?.getReader() || null;
      const decoder = new TextDecoder();

      if (!this.reader) {
        throw new Error("No readable stream");
      }

      this.isSubscribed = true;
      await this.readStream(decoder, callbacks);
    } catch (error) {
      console.error("Streaming error:", error);
      callbacks.onDisconnect();
      callbacks.onError("Connection to price stream failed");

      // Retry connection after 5 seconds
      if (this.isSubscribed) {
        this.retryTimeout = setTimeout(() => this.connect(callbacks), 5000);
      }
    }
  }

  // Read and parse incoming price updates from the stream
  private async readStream(
    decoder: TextDecoder,
    callbacks: PriceStreamCallbacks
  ): Promise<void> {
    if (!this.reader) return;

    try {
      while (this.isSubscribed) {
        const { done, value } = await this.reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const update: PriceUpdate = JSON.parse(line);
            console.log("Price update:", update);
            callbacks.onPriceUpdate(update);
          } catch (parseError) {
            console.error("Error parsing price update:", parseError);
          }
        }
      }
    } catch (error) {
      console.error("Error reading stream:", error);
      callbacks.onError("Error reading price stream");
    }
  }

  // Disconnect from price stream and cleanup resources
  disconnect(): void {
    this.isSubscribed = false;
    
    if (this.reader) {
      this.reader.cancel();
      this.reader = null;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }
}
