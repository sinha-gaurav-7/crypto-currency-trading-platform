"use client";

// Props interface for connection status display
interface ConnectionStatusProps {
  isConnected: boolean;
}

// Component to display real-time price streaming connection status
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
}) => {
  return (
    <div
      className={`connection-status ${
        isConnected ? "connected" : "disconnected"
      }`}
    >
      {isConnected ? "Connected to live prices" : "Disconnected"}
    </div>
  );
};
