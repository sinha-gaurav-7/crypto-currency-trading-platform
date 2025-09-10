// Import generated protobuf types instead of duplicating interfaces
export { 
  AddTickerRequest, 
  RemoveTickerRequest, 
  SubscribeRequest, 
  Empty, 
  PriceUpdate,
  TradingStatus,
  TickerInfo,
  TickerList,
  ErrorResponse,
  ConnectRequest,
  DisconnectRequest,
  ClientStats,
  GetTickerInfoRequest
} from '../gen/proto/trading_pb.js';

// Extended ticker information with additional backend fields
export interface TickerInfoExtended {
  lastPrice?: string;
  priceChange?: string;
  volume?: string;
}
