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
      await locator.waitFor({ state: 'visible', timeout: 4000 });
      await locator.fill(text);
    } catch (error) {
      logger.warn(`Locator fill failed for ${selector}, trying page.fill: ${error}`);
      try {
        // Try a quick page.fill with a short timeout to avoid waiting until the test-level timeout.
        await this.page.fill(selector, text, { timeout: 3000 });
        return;
      } catch (err) {
        logger.warn(`page.fill failed quickly for ${selector}: ${err}. Proceeding to JS/frame fallback.`);
        try {
          if (this.page.isClosed && this.page.isClosed()) throw new Error('Page is closed');

          // First, try to find the element inside any frame (useful for payment iframes)
          for (const frame of this.page.frames()) {
            try {
              const fh = await frame.$(selector);
              if (!fh) continue;
              const fSuccess = await fh.evaluate((el, val) => {
                const input = el as HTMLInputElement | null;
                if (!input) return false;
                input.value = val;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
              }, text);
              if (fSuccess) {
                try {
                  await fh.scrollIntoViewIfNeeded();
                  await fh.focus();
                  await this.page.keyboard.type(text, { delay: 20 });
                } catch {
                  // ignore
                }
                return;
              }
            } catch {
              // ignore frame errors and try next frame
            }
          }

          // Use element-handle evaluate on main page as a fallback
          const handle = await this.page.$(selector);
          if (!handle) throw new Error('Element handle not found for JS fallback');
          const success = await handle.evaluate(
            (el, val) => {
              const input = el as HTMLInputElement | null;
              if (!input) return false;
              input.value = val;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            },
            text
          );

          if (!success) throw new Error('JS fallback could not set element value');

          // As an additional safety, focus the element handle and type (best-effort)
          try {
            await handle.scrollIntoViewIfNeeded();
            await handle.focus();
            await this.page.keyboard.type(text, { delay: 20 });
          } catch {
            // ignore typing/focus failure if JS set value succeeded
          }

          return;
        } catch (e2) {
          logger.error(`Failed JS fallback for ${selector}: ${e2}`);
          throw e2;
        }
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
