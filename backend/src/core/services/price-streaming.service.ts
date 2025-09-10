import { IStreamingService } from '../interfaces/streaming.interface';
import { PriceUpdate, ClientStats } from '../../models/trading.models';
import { ClientManager } from '../../infrastructure/streaming/client-manager';
import { logger } from '../../utils/logger.util';
import { TRADING_CONSTANTS } from '../../constants/trading.constants';
import { AsyncUtil } from '../../utils/async.util';

// Manages real-time price streaming to connected clients
export class PriceStreamingService implements IStreamingService {
  private clientManager: ClientManager;
  private isRunning = false;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.clientManager = new ClientManager();
    // Disable automatic cleanup to prevent recursion issues
    // this.startCleanupTask();
  }

  // Add a new client to the streaming service
  async addClient(clientId: string): Promise<void> {
    try {
      // Store the client ID for later updates - no callback needed here
      await this.clientManager.addClient(clientId, () => {
        // This callback won't be used - we'll send updates directly
        logger.debug(`Callback called for client ${clientId}`, 'PriceStreamingService');
      });
      logger.info(`Client ${clientId} added to streaming service`, 'PriceStreamingService');
    } catch (error) {
      logger.error(`Failed to add client ${clientId}`, 'PriceStreamingService', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  // Remove a client from the streaming service
  async removeClient(clientId: string): Promise<void> {
    try {
      await this.clientManager.removeClient(clientId);
      logger.info(`Client ${clientId} removed from streaming service`, 'PriceStreamingService');
    } catch (error) {
      logger.error(`Failed to remove client ${clientId}`, 'PriceStreamingService', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  // Broadcast price updates to all connected clients
  async broadcastUpdate(update: PriceUpdate): Promise<void> {
    try {
      const activeClients = this.clientManager.getActiveClients();
      
      if (activeClients.length === 0) {
        logger.debug('No active clients to broadcast to', 'PriceStreamingService');
        return;
      }

      logger.debug(`Broadcasting update to ${activeClients.length} clients: ${update.ticker} = ${update.price}`, 'PriceStreamingService');

      // Send update to all active clients
      const sendPromises = activeClients.map(clientId => 
        this.clientManager.sendUpdate(clientId, update)
      );

      await Promise.allSettled(sendPromises);
      
      logger.debug(`Successfully broadcasted update to ${activeClients.length} clients`, 'PriceStreamingService');
    } catch (error) {
      logger.error('Failed to broadcast update', 'PriceStreamingService', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  // Get count of active clients
  getActiveClientCount(): number {
    return this.clientManager.getActiveClientCount();
  }

  // Check if a specific client is active
  isClientActive(clientId: string): boolean {
    return this.clientManager.isClientActive(clientId);
  }

  // Get list of active client IDs
  getActiveClients(): string[] {
    return this.clientManager.getActiveClients();
  }

  // Get client connection statistics
  getClientStats() {
    return this.clientManager.getConnectionStats();
  }

  // Get client connection history
  getConnectionHistory() {
    return this.clientManager.getConnectionHistory();
  }

  // Start automatic client cleanup task
  private startCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clean up inactive clients every 5 minutes
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.clientManager.cleanupInactiveClients();
      } catch (error) {
        logger.error('Error during client cleanup', 'PriceStreamingService', { error: error instanceof Error ? error.message : String(error) });
      }
    }, 300000); // 5 minutes

    this.isRunning = true;
    logger.info('Client cleanup task started', 'PriceStreamingService');
  }

  // Stop automatic client cleanup task
  stopCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    logger.info('Client cleanup task stopped', 'PriceStreamingService');
  }

  // Cleanup all resources and shutdown service
  async destroy(): Promise<void> {
    logger.info('Shutting down price streaming service...', 'PriceStreamingService');
    
    this.stopCleanupTask();
    
    // Close all client connections
    const activeClients = this.clientManager.getActiveClients();
    for (const clientId of activeClients) {
      try {
        await this.clientManager.removeClient(clientId);
      } catch (error) {
        logger.error(`Error removing client ${clientId} during shutdown`, 'PriceStreamingService', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    logger.info('Price streaming service shut down', 'PriceStreamingService');
  }
}
