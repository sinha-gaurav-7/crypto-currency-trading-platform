export const formatPrice = (price: string): string => {
  if (price === "Loading...") return price;
  return `$${price}`;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString();
};

export const formatTickerCount = (count: number): string => {
  return `Active Tickers (${count})`;
};
