import { IClientManager } from '../../core/interfaces/streaming.interface';
import { PriceUpdate } from '../../models/trading.models';
import { StreamingClient, ClientConnection } from '../../models/streaming.models';
import { logger } from '../../utils/logger.util';
import { ClientConnectionError, ClientDisconnectionError } from '../../errors/streaming.error';

// Manages streaming client connections and price update delivery
export class ClientManager implements IClientManager {
  private clients: Map<string, StreamingClient> = new Map();
  private connectionHistory: ClientConnection[] = [];

  // Add new client to streaming service
  async addClient(clientId: string, callback: (update: PriceUpdate) => void): Promise<void> {
    try {
      if (this.clients.has(clientId)) {
        logger.warn(`Client ${clientId} already exists, replacing connection`, 'ClientManager');
        await this.removeClient(clientId);
      }

      const client: StreamingClient = {
        id: clientId,
        callback,
        isActive: true,
        connectedAt: Date.now(),
        lastActivity: Date.now(),
      };

      this.clients.set(clientId, client);
      
      this.recordConnection({
        clientId,
        status: 'connected',
        timestamp: Date.now(),
      });

      logger.info(`Client ${clientId} connected`, 'ClientManager');
    } catch (error) {
      logger.error(`Failed to add client ${clientId}`, 'ClientManager', { error: error instanceof Error ? error.message : String(error) });
      throw new ClientConnectionError(`Failed to add client ${clientId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Remove client from streaming service
  async removeClient(clientId: string): Promise<void> {
    try {
      const client = this.clients.get(clientId);
      if (client) {
        client.isActive = false;
        this.clients.delete(clientId);
        
        this.recordConnection({
          clientId,
          status: 'disconnected',
          timestamp: Date.now(),
        });

        logger.info(`Client ${clientId} disconnected`, 'ClientManager');
      }
    } catch (error) {
      logger.error(`Failed to remove client ${clientId}`, 'ClientManager', { error: error instanceof Error ? error.message : String(error) });
      throw new ClientDisconnectionError(`Failed to remove client ${clientId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Send price update to specific client
  async sendUpdate(clientId: string, update: PriceUpdate): Promise<void> {
    const client = this.clients.get(clientId);
    if (client && client.isActive) {
      try {
        client.callback(update);
        client.lastActivity = Date.now();
      } catch (error) {
        logger.error(`Failed to send update to client ${clientId}`, 'ClientManager', { error: error instanceof Error ? error.message : String(error) });
        // Mark client as inactive if callback fails
        client.isActive = false;
      }
    }
  }

  // Get list of active client IDs
  getActiveClients(): string[] {
    return Array.from(this.clients.values())
      .filter(client => client.isActive)
      .map(client => client.id);
  }

  // Get total client count
  getClientCount(): number {
    return this.clients.size;
  }

  // Get count of active clients
  getActiveClientCount(): number {
    return this.getActiveClients().length;
  }

  // Check if specific client is active
  isClientActive(clientId: string): boolean {
    const client = this.clients.get(clientId);
    return client ? client.isActive : false;
  }

  // Get detailed client information
  getClientInfo(clientId: string): StreamingClient | undefined {
    return this.clients.get(clientId);
  }

  // Update client activity timestamp
  updateClientActivity(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastActivity = Date.now();
    }
  }

  // Get list of inactive clients based on timeout
  getInactiveClients(timeoutMs: number = 300000): string[] { // 5 minutes default
    const now = Date.now();
    return Array.from(this.clients.values())
      .filter(client => now - client.lastActivity > timeoutMs)
      .map(client => client.id);
  }

  // Clean up inactive clients (currently disabled)
  async cleanupInactiveClients(timeoutMs: number = 300000): Promise<void> {
    // Simplified cleanup - just log inactive clients without removing them
    const inactiveClients = this.getInactiveClients(timeoutMs);
    
    if (inactiveClients.length > 0) {
      logger.info(`Found ${inactiveClients.length} inactive clients (cleanup disabled)`, 'ClientManager');
    }
  }

  // Record client connection/disconnection events
  private recordConnection(connection: ClientConnection): void {
    this.connectionHistory.push(connection);
    
    // Keep only last 1000 connections
    if (this.connectionHistory.length > 1000) {
      this.connectionHistory = this.connectionHistory.slice(-1000);
    }
  }

  // Get connection history for monitoring
  getConnectionHistory(): ClientConnection[] {
    return [...this.connectionHistory];
  }

  // Get connection statistics
  getConnectionStats(): { total: number; active: number; disconnected: number } {
    const total = this.connectionHistory.length;
    const active = this.getActiveClientCount();
    const disconnected = total - active;
    
    return { total, active, disconnected };
  }
}
