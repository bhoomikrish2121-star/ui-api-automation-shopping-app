import { Page, Locator } from '@playwright/test';
import { logger } from '../utils/logger';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string): Promise<void> {
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle' });
    logger.info('Page loaded successfully');
  }

  async waitForElement(selector: string, timeout: number = 10000): Promise<void> {
    logger.info(`Waiting for element: ${selector}`);
    await this.page.waitForSelector(selector, { timeout });
  }

  async click(selector: string): Promise<void> {
    logger.info(`Clicking element: ${selector}`);
    try {
      const locator = this.page.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      await locator.scrollIntoViewIfNeeded();
      await locator.click({ timeout: 5000 });
    } catch (error) {
      logger.warn(`Direct click failed for ${selector}, attempting JS fallback: ${error}`);
      try {
        // Try Playwright locator click as a fallback (handles Playwright pseudo-selectors like text=, :has-text)
        try {
          const fallbackLocator = this.page.locator(selector).first();
          await fallbackLocator.click({ timeout: 3000 });
          return;
        } catch {
          // If Playwright locator click fails, fall back to DOM click for pure CSS selectors
        }

        const clicked = await this.page.evaluate((sel) => {
          try {
            const el = document.querySelector(sel as string) as HTMLElement | null;
            if (el) {
              el.click();
              return true;
            }
            const all = Array.from(document.querySelectorAll(sel as string));
            if (all.length > 0) {
              (all[0] as HTMLElement).click();
              return true;
            }
            return false;
          } catch {
            return false;
          }
        }, selector);
        if (!clicked) throw new Error('JS fallback could not find element');
      } catch (err) {
        logger.error(`Failed to click element ${selector}: ${err}`);
        throw err;
      }
    }
  }

  async fill(selector: string, text: string): Promise<void> {
    logger.info(`Filling field: ${selector} with value: ${text}`);
    try {
      const locator = this.page.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout: 3000 });
      await locator.fill(text);
    } catch (error) {
      logger.warn(`Locator fill failed for ${selector}, trying keyboard input: ${error}`);
      try {
        // Check if page is still open
        if (this.page.isClosed()) {
          throw new Error('Page is closed, cannot fill field');
        }

        // Try clicking on the field first, then type
        try {
          const field = this.page.locator(selector).first();
          await field.click().catch(() => {
            // If click fails, just continue to typing
            logger.debug(`Click failed on field, will try typing anyway`);
          });
        } catch {
          // ignore click errors
        }
        
        // Type the text using keyboard (with page check)
        if (!this.page.isClosed()) {
          await this.page.keyboard.type(text, { delay: 30 });
        } else {
          throw new Error('Page is closed, cannot type');
        }
      } catch (err) {
        logger.error(`Failed to fill ${selector}: ${err}`);
        throw err;
      }
    }
  }

  async getText(selector: string): Promise<string> {
    logger.info(`Getting text from: ${selector}`);
    try {
      const locator = this.page.locator(selector).first();
      const txt = await locator.textContent();
      return txt || '';
    } catch {
      return (await this.page.textContent(selector)) || '';
    }
  }

  async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      logger.warn(`Element not visible: ${selector}`);
      return false;
    }
  }

  async takeScreenshot(filename: string): Promise<void> {
    const screenshotPath = `reports/screenshots/${filename}.png`;
    logger.info(`Taking screenshot: ${screenshotPath}`);
    await this.page.screenshot({ path: screenshotPath });
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
