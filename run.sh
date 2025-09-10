set -e

echo "Starting Crypto Streaming Application..."

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    pkill -f "tsx.*server.ts" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node.*server" 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Install dependencies if not already installed
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install --recursive
fi

# Create proto directory and basic proto file if they don't exist
if [ ! -d "proto" ]; then
    echo "Creating proto directory..."
    mkdir proto
fi

if [ ! -f "proto/trading.proto" ]; then
    echo "Creating basic proto definition..."
    cat > proto/trading.proto << 'EOF'
syntax = "proto3";

package trading.v1;

message PriceUpdate {
  string ticker = 1;
  string price = 2;
  int64 timestamp = 3;
}

message AddTickerRequest {
  string ticker = 1;
}

message RemoveTickerRequest {
  string ticker = 1;
}

message SubscribeRequest {}

message Empty {}

service TradingService {
  rpc AddTicker(AddTickerRequest) returns (Empty);
  rpc RemoveTicker(RemoveTickerRequest) returns (Empty);
  rpc StreamPrices(SubscribeRequest) returns (stream PriceUpdate);
}
EOF
fi

# Create buf configuration files if they don't exist
if [ ! -f "buf.gen.yaml" ]; then
    echo "Creating buf configuration..."
    cat > buf.gen.yaml << 'EOF'
version: v1
plugins:
  - plugin: buf.build/bufbuild/es:v1.4.2
    out: backend/src/gen
  - plugin: buf.build/bufbuild/es:v1.4.2
    out: frontend/src/gen
  - plugin: buf.build/connectrpc/es:v1.1.4
    out: backend/src/gen
  - plugin: buf.build/connectrpc/es:v1.4
    out: frontend/src/gen
EOF
fi

if [ ! -f "buf.yaml" ]; then
    cat > buf.yaml << 'EOF'
version: v1
breaking:
  use:
    - FILE
lint:
  use:
    - DEFAULT
EOF
fi

# Create source directories
mkdir -p backend/src frontend/src/pages frontend/src/components

# Generate protobuf code
echo "Generating protobuf code..."
if command -v buf &> /dev/null; then
    pnpm buf generate --path proto
else
    echo "Warning: buf not found, skipping protobuf generation for now"
fi

# Install Playwright browsers if not already installed
if [ ! -d "backend/node_modules/playwright" ] || [ ! -d "backend/node_modules/playwright/.local-browsers" ]; then
    echo "Setting up Playwright browsers..."
    (cd backend && pnpm playwright install chromium)
fi

# Kill any existing processes on the required ports
echo "Cleaning up existing processes..."
pkill -f "tsx.*server.ts" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
# Skip lsof commands that don't work on Windows Git Bash
if command -v lsof &> /dev/null; then
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Wait for processes to clean up
sleep 2

# Create basic server file if it doesn't exist
if [ ! -f "backend/src/server.ts" ]; then
    echo "Creating basic backend server..."
    cat > backend/src/server.ts << 'EOF'
import { createConnectTransport } from "@connectrpc/connect-node";
import { createRouterTransport } from "@connectrpc/connect";

const port = process.env.PORT || 8080;

console.log("Backend server starting on port", port);
console.log("Backend server ready - waiting for frontend...");

// Basic server setup - will be implemented with full functionality
const server = require('http').createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Backend server running - ready for ConnectRPC implementation\n');
});

server.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});
EOF
fi

# Create basic Next.js page if it doesn't exist
if [ ! -f "frontend/src/pages/index.tsx" ]; then
    echo "Creating basic frontend page..."
    cat > frontend/src/pages/index.tsx << 'EOF'
import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Crypto Streaming App</h1>
      <p>Frontend is running - ready for implementation</p>
      <p>Backend connection will be added next</p>
    </div>
  );
}
EOF
fi

# Start backend server in background
echo "Starting backend server on port 8080..."
if [ -d "backend" ]; then
    (cd backend && pnpm start) &
    BACKEND_PID=$!
else
    echo "Error: backend directory not found!"
    exit 1
fi

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 4

# Start frontend server in background
echo "Starting frontend server on port 3000..."
if [ -d "frontend" ]; then
    (cd frontend && pnpm dev) &
    FRONTEND_PID=$!
else
    echo "Error: frontend directory not found!"
    exit 1
fi

# Wait for frontend to be ready
echo "Waiting for frontend to start..."
sleep 6

echo ""
echo "Application started successfully!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080"

# Wait for user to exit (keep script running)
wait