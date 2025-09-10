import type { AppProps } from "next/app";
import "../styles/globals.css";

// Root Next.js app component that wraps all pages
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
