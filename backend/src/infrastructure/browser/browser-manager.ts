import { Browser, BrowserContext, chromium } from 'playwright';
import { IBrowserManager, IBrowserContext } from '../../core/interfaces/browser.interface';
import { browserConfig } from '../../config/browser.config';
import { logger } from '../../utils/logger.util';
import { BrowserInitializationError } from '../../errors/browser.error';

// Manages Playwright browser lifecycle and context creation
export class BrowserManager implements IBrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private _isInitialized = false;

  // Initialize Playwright browser with configuration
  async initialize(): Promise<void> {
    if (this._isInitialized) {
      logger.debug('Browser already initialized', 'BrowserManager');
      return;
    }

    try {
      logger.info('Initializing Playwright browser...', 'BrowserManager');
      
      this.browser = await chromium.launch({
        headless: browserConfig.headless,
        args: [...browserConfig.args],
      });

      this.context = await this.browser.newContext({
        userAgent: browserConfig.userAgent,
      });

      this._isInitialized = true;
      logger.info('Playwright browser initialized successfully', 'BrowserManager');
    } catch (error) {
      logger.error('Failed to initialize browser', 'BrowserManager', { error: error instanceof Error ? error.message : String(error) });
      throw new BrowserInitializationError(`Failed to initialize browser: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Create new browser context for isolated sessions
  async createContext(): Promise<IBrowserContext> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.context) {
      throw new BrowserInitializationError('Browser context not available');
    }

    return new ContextManager(this.context);
  }

  // Get underlying browser instance
  getBrowser(): Browser | null {
    return this.browser;
  }

  // Check if browser is initialized
  isInitialized(): boolean {
    return this._isInitialized;
  }

  // Cleanup browser resources
  async destroy(): Promise<void> {
    logger.info('Shutting down browser manager...', 'BrowserManager');
    
    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    this._isInitialized = false;
    logger.info('Browser manager shut down', 'BrowserManager');
  }
}

// Manages individual browser contexts
class ContextManager implements IBrowserContext {
  constructor(private context: BrowserContext) {}

  // Create new page in context
  async createPage(): Promise<IPage> {
    const page = await this.context.newPage();
    return new PageWrapper(page);
  }

  // Close context and cleanup
  async close(): Promise<void> {
    await this.context.close();
  }

  // Get underlying context instance
  getContext(): BrowserContext | null {
    return this.context;
  }
}

// Wraps Playwright page with custom interface
class PageWrapper implements IPage {
  constructor(private page: any) {}

  // Navigate to URL with timeout
  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { 
      waitUntil: 'networkidle', 
      timeout: browserConfig.navigationTimeout 
    });
  }

  // Wait for element to appear
  async waitForSelector(selector: string, timeout: number = browserConfig.selectorTimeout): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  // Extract text content from element
  async extractText(selector: string): Promise<string | null> {
    const element = await this.page.$(selector);
    if (element) {
      return await element.textContent();
    }
    return null;
  }

  // Close page
  async close(): Promise<void> {
    await this.page.close();
  }

  // Add event listener to page
  on(event: string, handler: Function): void {
    this.page.on(event, handler);
  }

  // Get underlying page instance
  getPage(): any {
    return this.page;
  }
}

// Import the IPage interface
import { IPage } from '../../core/interfaces/browser.interface';
