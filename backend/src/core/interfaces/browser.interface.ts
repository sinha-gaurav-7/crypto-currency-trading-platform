import { Browser as PlaywrightBrowser, BrowserContext as PlaywrightBrowserContext, Page as PlaywrightPage } from 'playwright';

// Browser management interface for automation
export interface IBrowserManager {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  createContext(): Promise<IBrowserContext>;
  getBrowser(): PlaywrightBrowser | null;
  isInitialized(): boolean;
}

// Browser context interface for isolated sessions
export interface IBrowserContext {
  createPage(): Promise<IPage>;
  close(): Promise<void>;
  getContext(): PlaywrightBrowserContext | null;
}

// Page interface for web page operations
export interface IPage {
  navigate(url: string): Promise<void>;
  waitForSelector(selector: string, timeout?: number): Promise<void>;
  extractText(selector: string): Promise<string | null>;
  close(): Promise<void>;
  on(event: string, handler: Function): void;
  getPage(): PlaywrightPage | null;
}
