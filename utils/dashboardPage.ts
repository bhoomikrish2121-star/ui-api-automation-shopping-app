import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { logger } from './logger';

export class DashboardPage extends BasePage {
  // Locators
  readonly searchBox = 'input[placeholder="search"]';
  readonly searchBoxVisible = 'input[placeholder="search"]:visible';
  readonly searchResults = '.product, [data-test="product"], [class*="product"]';
  readonly productName = (name: string) => `text=/${name}/i`;
  readonly addToCartButton = 'button:has-text("Add To Cart"), button:has-text("Add to Cart"), button:has-text("Add")';
  readonly cartIcon = 'button:has-text("Cart"), [class*="cart"], a[href*="cart"]';
  readonly cartCount = '[class*="badge"]';
  readonly signOutButton = 'button:has-text("Sign Out"), text=Sign Out';
  readonly logoutButton = 'button:has-text("Logout"), a:has-text("Logout")';
  readonly noProductsMessage = 'text=/no products|no results|nothing found|not found/i';

  constructor(page: Page) {
    super(page);
  }

  async isOnDashboard(): Promise<boolean> {
    try {
      const signOutLocator = this.page.locator(this.signOutButton).first();
      await signOutLocator.waitFor({ state: 'visible', timeout: 5000 });
      logger.info('User is on dashboard via Sign Out button');
      return true;
    } catch {
      try {
        await this.page.locator(this.searchBoxVisible).first().waitFor({ state: 'visible', timeout: 5000 });
        logger.info('User is on dashboard via search box');
        return true;
      } catch {
        logger.warn('User is not on dashboard');
        return false;
      }
    }
  }

  async getDashboardTitle(): Promise<string> {
    return await this.getTitle();
  }

  async searchProduct(productName: string): Promise<void> {
    logger.info(`Searching for product: ${productName}`);
    
    try {
      let searchInput = this.page.locator(this.searchBoxVisible).first();
      const visibleCount = await searchInput.count();
      if (visibleCount === 0) {
        searchInput = this.page.locator(this.searchBox).first();
      }
      
      const totalCount = await searchInput.count();
      if (totalCount === 0) {
        logger.error('Search box not found in DOM');
        throw new Error('Search box locator not found');
      }
      
      await searchInput.scrollIntoViewIfNeeded();
      await searchInput.click({ force: true });
      
      await this.page.waitForTimeout(300);
      await searchInput.fill('', { timeout: 5000 });
      await this.page.waitForTimeout(300);
      
      await searchInput.type(productName, { delay: 50 });
      logger.info(`Typed product name: ${productName}`);
      
      await searchInput.press('Enter');
      logger.info('Search triggered by pressing Enter');
      
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
      logger.info('Search results loaded');
    } catch (error) {
      logger.error(`Search failed: ${error}`);
      throw error;
    }
  }

  async isProductDisplayed(productName: string): Promise<boolean> {
    try {
      const productLocator = `text=/${productName}/i`;
      await this.waitForElement(productLocator, 5000);
      logger.info(`Product found: ${productName}`);
      return true;
    } catch {
      logger.warn(`Product not found: ${productName}`);
      return false;
    }
  }

  async addProductToCart(): Promise<void> {
    logger.info('Adding product to cart');
    const addButtons = this.page.locator(this.addToCartButton);
    try {
      await addButtons.first().waitFor({ state: 'visible', timeout: 3000 });
      await addButtons.first().scrollIntoViewIfNeeded();
      await addButtons.first().click({ timeout: 7000 });
      await this.page.waitForTimeout(500);
      return;
    } catch {
      logger.warn('Primary add button failed, trying product-scoped add buttons');
    }

    // Try add button within product cards
    try {
      const cards = this.page.locator(this.searchResults);
      const count = await cards.count();
      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);
        const add = card.locator('button:has-text("Add"), button:has-text("Add To Cart"), button:has-text("Add to Cart")');
        const c = await add.count();
        if (c > 0) {
          await add.first().scrollIntoViewIfNeeded();
          await add.first().click({ timeout: 5000 });
          await this.page.waitForTimeout(500);
          return;
        }
      }
    } catch (e) {
      logger.warn('Product-scoped add attempt failed');
    }

    // Final fallback: click any visible add button on page
    try {
      const fallback = this.page.locator('button:has-text("Add"), button:has-text("Add To Cart")').first();
      await fallback.waitFor({ state: 'visible', timeout: 3000 });
      await fallback.click({ timeout: 5000 });
      await this.page.waitForTimeout(500);
      return;
    } catch (e) {
      logger.error('Unable to add product to cart');
      throw e;
    }
  }

  async goToCart(): Promise<void> {
    logger.info('Going to cart');
    // Try multiple selector strategies to click the cart icon
    const candidates = [
      this.cartIcon,
      'a[href*="#/cart"]',
      'a[href*="/cart"]',
      'button[aria-label*="cart"]',
      '[data-test="cart"]',
      '[id*="cart"]',
      'button[class*="cart"]',
      'text=Cart'
    ];

    for (const sel of candidates) {
      try {
        const loc = this.page.locator(sel).first();
        await loc.waitFor({ state: 'visible', timeout: 1500 });
        await loc.scrollIntoViewIfNeeded();
        await loc.click({ timeout: 5000 });
        logger.info(`Clicked cart using selector: ${sel}`);
        // Wait for cart indicators (checkout button or cart URL) to appear
        try {
          await this.page.waitForSelector('button:has-text("Checkout"), button:has-text("Proceed to Checkout"), a[href*="#/cart"], a[href*="/cart"]', { timeout: 5000 });
          return;
        } catch {
          try {
            await this.page.waitForURL('**/cart**', { timeout: 5000 });
            return;
          } catch {
            // continue to next selector fallback
          }
        }
      } catch (e) {
        // try next selector
        continue;
      }
    }

    // JS fallback: try to find an element with Cart text and click it
    try {
      const clicked = await this.page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('a,button,div,span'));
        for (const el of all) {
          const txt = el.textContent ? el.textContent.trim() : '';
          if (txt && /cart/i.test(txt)) {
            (el as HTMLElement).click();
            return true;
          }
        }
        return false;
      });
      if (clicked) {
        await this.waitForNavigation();
        logger.info('Clicked cart via JS fallback');
        return;
      }
    } catch (e) {
      logger.warn('JS fallback for cart click failed');
    }

    // Final fallback: navigate directly to cart hash
    try {
      const current = this.page.url();
      const base = current.split('#')[0];
      await this.page.goto(base + '#/cart');
      await this.waitForNavigation();
      logger.info('Navigated directly to cart URL');
      return;
    } catch (e) {
      logger.error('All cart navigation strategies failed');
      throw new Error('Unable to navigate to cart');
    }
  }

  async logout(): Promise<void> {
    logger.info('Logging out');
    await this.click(this.logoutButton);
    await this.waitForNavigation();
  }

  async isNoProductsMessageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.noProductsMessage);
  }
}
