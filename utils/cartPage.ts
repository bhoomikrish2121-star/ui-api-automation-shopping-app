import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { logger } from './logger';

export class CartPage extends BasePage {
  // Locators
  readonly cartItems = '.cartItems, .cart-item, [class*="cart-item"]';
  readonly checkoutButton = 'button:has-text("Checkout"), button:has-text("Proceed to Checkout"), button:has-text("Pay")';
  readonly removeButton = 'button[class*="remove"], button:has-text("Remove")';
  readonly quantityInput = 'input[type="number"], input[name*="quantity"]';
  readonly emptyCartMessage = 'text=/No Products in your cart|Your cart is empty|No items in cart|Cart is empty/i';
  readonly subtotal = '[class*="subtotal"], text=/Subtotal/';

  constructor(page: Page) {
    super(page);
  }

  async isOnCartPage(): Promise<boolean> {
    try {
      await this.waitForElement(this.checkoutButton, 5000);
      logger.info('User is on cart page');
      return true;
    } catch {
      logger.warn('User is not on cart page');
      return false;
    }
  }

  async getCartItemsCount(): Promise<number> {
    try {
      const items = await this.page.locator(this.cartItems).count();
      logger.info(`Cart contains ${items} items`);
      return items;
    } catch {
      logger.warn('Could not get cart items count');
      return 0;
    }
  }

  async isProductInCart(productName: string): Promise<boolean> {
    try {
      const productLocator = `text="${productName}"`;
      await this.waitForElement(productLocator, 5000);
      logger.info(`Product "${productName}" found in cart`);
      return true;
    } catch {
      logger.warn(`Product "${productName}" not found in cart`);
      return false;
    }
  }

  async removeProduct(): Promise<void> {
    logger.info('Removing product from cart');
    await this.click(this.removeButton);
    await this.page.waitForTimeout(1000);
  }

  async updateQuantity(quantity: number): Promise<void> {
    logger.info(`Updating quantity to: ${quantity}`);
    await this.page.fill(this.quantityInput, quantity.toString());
  }

  async proceedToCheckout(): Promise<void> {
    logger.info('Proceeding to checkout');
    // Click checkout and wait for checkout page indicators (place order button or country input)
    try {
      await this.click(this.checkoutButton);
    } catch (e) {
      logger.warn(`Clicking checkout button failed: ${e}`);
    }

    try {
      await this.page.waitForSelector('button:has-text("Place Order"), input[placeholder*="Country"], input[aria-label*="Country"]', { timeout: 7000 });
      logger.info('Checkout page indicators visible');
    } catch {
      try {
        await this.page.waitForURL('**/checkout**', { timeout: 7000 });
      } catch {
        logger.warn('Proceed to checkout did not navigate to checkout page reliably');
      }
    }
  }

  async isEmptyCartMessageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.emptyCartMessage);
  }
}
