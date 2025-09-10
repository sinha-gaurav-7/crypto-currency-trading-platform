import { createServer, IncomingMessage, ServerResponse } from "http";
import { TradingService } from "./core/services/trading.service";
import { BrowserManager } from "./infrastructure/browser/browser-manager";
import { BrowserOrchestratorService } from "./core/services/browser-orchestrator.service";
import { PriceStreamingService } from "./core/services/price-streaming.service";
import { corsMiddleware } from "./api/middleware/cors.middleware";
import { loggingMiddleware } from "./api/middleware/logging.middleware";
import { errorMiddleware } from "./api/middleware/error.middleware";
import { Routes } from "./api/routes";
import { TradingRoutes } from "./api/routes/trading.routes";
import { HealthRoutes } from "./api/routes/health.routes";
import { TradingController } from "./api/controllers/trading.controller";
import { HealthController } from "./api/controllers/health.controller";
import { API_CONSTANTS } from "./constants/api.constants";

// Server port configuration
const port = process.env.PORT || API_CONSTANTS.DEFAULT_PORT;

console.log("Backend server starting on port", port);

// Initialize core services
const browserManager = new BrowserManager();
const browserOrchestrator = new BrowserOrchestratorService(browserManager);
const priceStreaming = new PriceStreamingService();
const tradingService = new TradingService(browserOrchestrator, priceStreaming);

// Initialize API controllers
const tradingController = new TradingController(tradingService);
const healthController = new HealthController();

// Initialize route handlers
const tradingRoutes = new TradingRoutes(tradingController);
const healthRoutes = new HealthRoutes(healthController);
const routes = new Routes(tradingRoutes, healthRoutes);

// Create HTTP server with middleware chain
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    // Apply middleware chain: CORS → Logging → Business Logic
    corsMiddleware(req, res, () => {
      loggingMiddleware(req, res, () => {
        routes.handleRequest(req, res);
      });
    });
  } catch (error) {
    errorMiddleware(error, req, res, () => {});
  }
});

// Handle graceful shutdown on SIGINT
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await tradingService.shutdown();
  await browserManager.destroy();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle graceful shutdown on SIGTERM
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await tradingService.shutdown();
  await browserManager.destroy();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server and initialize services
server.listen(port, async () => {
  console.log(`Backend server listening on http://localhost:${port}`);
  console.log('ConnectRPC Trading Service ready');
  console.log('Available endpoints:');
  
  // Display all supported endpoints
  const endpoints = routes.getAllSupportedEndpoints();
  endpoints.forEach((endpoint: string) => {
    console.log(`  ${endpoint}`);
  });
  
  // Initialize browser automation
  try {
    await browserManager.initialize();
    console.log('Browser manager initialized successfully');
  } catch (error) {
    console.error('Failed to initialize browser manager:', error);
  }
});
