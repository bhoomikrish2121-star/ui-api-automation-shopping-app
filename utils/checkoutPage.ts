import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { logger } from './logger';

export class CheckoutPage extends BasePage {
  // Locators
  // Locators (robust selectors with fallbacks)
  readonly emailField = 'input[type="email"], input[placeholder*="email"], input[name="email"]';
  readonly countryDropdown = 'input[placeholder*="Country"], input[name*="country"], select[name*="country"]';
  // Use a CSS-based option matcher for click operations (avoid Playwright-only text= in JS fallback)
  readonly countryOption = (country: string) => `li:has-text("${country}"), div:has-text("${country}"), button:has-text("${country}")`;
  readonly placeOrderButton = 'button:has-text("Place Order"), button:has-text("Place order"), button[aria-label*="place order"]';
  readonly cvvInput = 'input[placeholder*="CVV"], input[name*="cvv"], input[id*="cvv"], input[placeholder*="CVC"], input[name*="cvc"]';
  readonly cardNameInput = 'input[name*="cardholderName"], input[placeholder*="Name on Card"], input[name*="cardName"], input[id*="card_name"]';
  readonly orderSummary = '[class*="order-summary"], text=/Order Summary/';
  readonly successMessage = '[class*="success"], text=Order placed successfully, text=Order Placed Successfully, text=Order Placed, text=Order confirmed, text=Thank you for the order, [class*="order-success"]';
  readonly errorMessage = '[class*="error"], [class*="alert"]';

  constructor(page: Page) {
    super(page);
  }

  async isOnCheckoutPage(): Promise<boolean> {
    try {
      await this.page.waitForSelector(
        `${this.placeOrderButton}, ${this.emailField}, ${this.countryDropdown}, ${this.cardNameInput}, ${this.cvvInput}`,
        { timeout: 7000 }
      );
      logger.info('User is on checkout page');
      return true;
    } catch {
      logger.warn('User is not on checkout page');
      return false;
    }
  }

  async enterEmail(email: string): Promise<void> {
    logger.info(`Entering email on checkout: ${email}`);
    // Try several possible selectors quickly to avoid waiting on a selector that may not exist
    const candidates = [
      this.emailField,
      'input[placeholder*="email"]',
      'input[name="email"]',
      'input[type="text"][placeholder*="email"]',
      'input[type="text"][name="email"]'
    ];

    for (const sel of candidates) {
      try {
        const locator = this.page.locator(sel).first();
        await locator.waitFor({ state: 'visible', timeout: 3000 });
        logger.info(`Using email selector: ${sel}`);
        await locator.scrollIntoViewIfNeeded();
        const enabled = await locator.isEnabled();
        if (!enabled) {
          logger.warn('Email input is not enabled yet, waiting briefly');
          await this.page.waitForTimeout(250);
        }
        await this.fill(sel, email);
        return;
      } catch {
        // try next candidate
      }
    }

    // Fallback to original selector with conservative wait
    logger.warn('No alternate email selector found quickly; falling back to primary selector');
    try {
      const locator = this.page.locator(this.emailField).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      logger.warn('Primary email selector did not become visible in extended timeout');
    }
    await this.fill(this.emailField, email);
  }

  async enterCountry(country: string): Promise<void> {
    logger.info(`Entering country on checkout: ${country}`);
    await this.selectCountry(country);
  }

  async selectCountry(country: string): Promise<void> {
    logger.info(`Selecting country: ${country}`);
    // Try filling the country input and selecting from dropdown suggestions
    try {
      await this.fill(this.countryDropdown, country);
      await this.page.waitForTimeout(500);
      // try clicking exact match option
      try {
        await this.click(this.countryOption(country));
        return;
      } catch {
        // try fuzzy match in dropdown list
        const opt = this.page.locator(`text=/${country}/i`).first();
        try {
          await opt.waitFor({ state: 'visible', timeout: 2000 });
          await opt.click({ timeout: 3000 });
          return;
        } catch {
          // fallback to pressing Enter
          await this.page.keyboard.press('Enter');
          return;
        }
      }
    } catch (e) {
      logger.warn(`Country selection failed, attempting Enter fallback: ${e}`);
      try {
        await this.page.keyboard.press('Enter');
      } catch {
        // give up
      }
    }
  }

  async enterCVV(cvv: string): Promise<void> {
    logger.info('Entering CVV');
    // Many payment providers load CVV inside a secure iframe (Stripe, Braintree, etc.).
    // Try common iframe selectors and fill the field inside the frame first.
    const iframeCandidates = [
      'iframe[name^="__privateStripeFrame"]',
      'iframe[src*="stripe"]',
      'iframe[src*="braintree"]',
      'iframe[title*="secure"]',
      'iframe[title*="Payment"]',
      'iframe[id*="pay"]',
      'iframe'
    ];

    const innerCvvSelectors = [
      'input[name*="cvc"]',
      'input[name*="cvv"]',
      'input[id*="cvc"]',
      'input[id*="cvv"]',
      'input[placeholder*="CVC"]',
      'input[placeholder*="CVV"]'
    ];

    // Try label-based fallbacks for CVV/CVC fields
    const cvvLabels = ['CVV', 'CVC', 'Card Verification', 'Security Code'];
    for (const labelText of cvvLabels) {
      try {
        const xpath = `xpath=//label[contains(normalize-space(.),"${labelText}")]/following::input[1]`;
        const labelInput = this.page.locator(xpath).first();
        await labelInput.waitFor({ state: 'visible', timeout: 500 });
        logger.info(`Filling CVV using label xpath for '${labelText}'`);
        await labelInput.fill(cvv);
        return;
      } catch {
        // try next
      }
    }

    for (const text of cvvLabels) {
      try {
        const xpath = `xpath=//*[contains(normalize-space(string(.)),"${text}")]/following::input[1]`;
        const nearInput = this.page.locator(xpath).first();
        await nearInput.waitFor({ state: 'visible', timeout: 500 });
        logger.info(`Filling CVV using nearby text xpath for '${text}'`);
        await nearInput.fill(cvv);
        return;
      } catch {
        // continue
      }
    }

    // Diagnostic: inspect frames and counts to help debug missing CVV
    try {
      const frames = this.page.frames();
      logger.info(`Found ${frames.length} frames on page`);
      for (const f of frames) {
        try {
          const info = await f.evaluate((sels) => {
            const counts: { [k: string]: number } = {};
            for (const s of sels as string[]) {
              try {
                counts[s] = document.querySelectorAll(s).length;
              } catch {
                counts[s] = -1;
              }
            }
            return { title: document.title || null, url: location.href, counts };
          }, innerCvvSelectors);
          logger.info(`Frame info: ${f.name() || '<no-name>'} ${info.url} title=${info.title} counts=${JSON.stringify(info.counts)}`);
        } catch (e) {
          logger.warn(`Could not evaluate frame ${f.name() || '<no-name>'}: ${e}`);
        }
      }
    } catch (diagErr) {
      logger.warn(`Frame diagnostic failed: ${diagErr}`);
    }

    // Final fallback: try filling main page selector via BasePage.fill
    logger.info(`Filling field: ${this.cvvInput} with value: ${cvv}`);
    await this.fill(this.cvvInput, cvv);
    await this.page.waitForTimeout(500); // Added wait time after filling CVV
  }

  async enterCardHolderName(name: string): Promise<void> {
    logger.info(`Entering cardholder name: ${name}`);
    // Card holder name may also appear inside a payment iframe — try frames first
    const iframeCandidates = [
      'iframe[name^="__privateStripeFrame"]',
      'iframe[src*="stripe"]',
      'iframe[title*="secure"]',
      'iframe[title*="Payment"]',
      'iframe'
    ];

    const innerNameSelectors = [
      'input[name*="cardholderName"]',
      'input[name*="cardName"]',
      'input[placeholder*="Name on Card"]',
      'input[id*="card_name"]',
      'input[name*="name"]'
    ];

    for (const frameSel of iframeCandidates) {
      try {
        const frameLocator = this.page.frameLocator(frameSel);
        for (const innerSel of innerNameSelectors) {
          try {
            const loc = frameLocator.locator(innerSel).first();
            await loc.waitFor({ state: 'visible', timeout: 1500 });
            logger.info(`Filling card name inside frame ${frameSel} using selector ${innerSel}`);
            await loc.fill(name);
            return;
          } catch {
            // try next inner selector
          }
        }
      } catch {
        // continue
      }
    }

    // Try label-based fallbacks for cardholder name (before main-page fill)
    const nameLabels = ['Name on Card', 'Cardholder Name', 'Card Holder Name', 'Cardholder'];
    for (const labelText of nameLabels) {
      try {
        const xpath = `xpath=//label[contains(normalize-space(.),"${labelText}")]/following::input[1]`;
        const labelInput = this.page.locator(xpath).first();
        await labelInput.waitFor({ state: 'visible', timeout: 500 });
        logger.info(`Filling cardholder name using label xpath for '${labelText}'`);
        await labelInput.fill(name);
        return;
      } catch {
        // try next
      }
    }

    // Also try nearby text nodes
    for (const text of nameLabels) {
      try {
        const xpath = `xpath=//*[contains(normalize-space(string(.)),"${text}")]/following::input[1]`;
        const nearInput = this.page.locator(xpath).first();
        await nearInput.waitFor({ state: 'visible', timeout: 500 });
        logger.info(`Filling cardholder name using nearby text xpath for '${text}'`);
        await nearInput.fill(name);
        return;
      } catch {
        // continue
      }
    }

    // Fallback to main page
    // Diagnostic: list inputs on main page to help identify actual selectors
    try {
      const inputs = await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll('input, textarea, select')).map((el) => ({
          tag: el.tagName,
          id: el.id || null,
          name: el.getAttribute('name'),
          placeholder: el.getAttribute('placeholder'),
          type: el.getAttribute('type'),
          outer: (el.outerHTML || '').slice(0, 300)
        }));
      });
      logger.info(`Main page inputs: ${JSON.stringify(inputs)}`);
    } catch (e) {
      logger.warn(`Could not list main page inputs: ${e}`);
    }

    await this.fill(this.cardNameInput, name);
    await this.page.waitForTimeout(500); // Added wait time after filling cardholder name
  }

  async placeOrder(): Promise<void> {
    logger.info('Placing order');
    const candidates = [
      this.placeOrderButton,
      'button:has-text("Confirm")',
      'button:has-text("Pay")',
      'button:has-text("Submit")',
      'input[type="submit"][value*="Place"]',
      'button[class*="place"]',
      'button[id*="place"]',
      'a:has-text("Place Order")',
      'button:has-text("Proceed to Pay")'
    ];

    for (const sel of candidates) {
      try {
        const locator = this.page.locator(sel).first();
        await locator.waitFor({ state: 'visible', timeout: 2000 });
        logger.info(`Clicking element: ${sel}`);
        await this.click(sel);
        await this.page.waitForTimeout(1000);

        // After clicking, check for known validation error indicating missing shipping info
        const err = await this.getErrorMessage();
        if (err && /please enter full shipping information/i.test(err)) {
          logger.warn('Place order failed due to missing shipping info; attempting to populate shipping fields and retry');
          const filled = await this.fillMissingShippingDetails();
          if (filled) {
            logger.info('Retrying place order after filling shipping info');
            try {
              await this.click(sel);
              await this.page.waitForTimeout(1000);
              return;
            } catch (e) {
              logger.warn(`Retry click failed: ${e}`);
              // continue to next candidate
            }
          }
        } else {
          return;
        }
      } catch {
        // try next candidate
      }
    }

    // Fallback: scan visible buttons/anchors/inputs for matching text
    try {
      const handles = await this.page.$$('button, a, input[type="submit"]');
      for (const h of handles) {
        try {
          const txt = (await h.evaluate((e: any) => (e.textContent || e.value || '').trim())) as string;
          if (/place order|confirm|pay|submit|proceed to pay/i.test(txt)) {
            await h.click();
            await this.page.waitForTimeout(1000);
            return;
          }
        } catch {
          // ignore and continue
        }
      }
    } catch {
      // continue to final fallback
    }

    // Final fallback: try primary selector with no waits
    try {
      await this.click(this.placeOrderButton);
    } catch (e) {
      logger.error(`Failed to place order: ${e}`);
      throw e;
    }
    await this.page.waitForTimeout(2000);
  }

  async fillMissingShippingDetails(): Promise<boolean> {
    logger.info('Attempting to fill missing shipping details');
    const fields = [
      { sel: 'input[name*="address"], input[placeholder*="Address"], input[id*="address"]', value: '123 Main St' },
      { sel: 'input[name*="address2"], input[placeholder*="Address 2"]', value: 'Suite 100' },
      { sel: 'input[name*="city"], input[placeholder*="City"]', value: 'New Delhi' },
      { sel: 'input[name*="state"], input[placeholder*="State"]', value: 'Delhi' },
      { sel: 'input[name*="postal"], input[name*="zip"], input[placeholder*="Postal"], input[placeholder*="Zip"]', value: '110001' },
      { sel: 'input[name*="phone"], input[placeholder*="Phone"], input[id*="phone"]', value: '9999999999' }
    ];

    let filledAny = false;
    for (const f of fields) {
      try {
        const count = await this.page.locator(f.sel).count();
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const loc = this.page.locator(f.sel).nth(i);
            try {
              const val = await loc.inputValue().catch(() => '');
              if (!val) {
                logger.info(`Filling shipping field ${f.sel} with ${f.value}`);
                await loc.fill(f.value);
                filledAny = true;
                await this.page.waitForTimeout(200);
              }
            } catch {
              // ignore individual fill failures
            }
          }
        }
      } catch {
        // ignore selector errors
      }
    }

    return filledAny;
  }

  async isOrderPlacedSuccessfully(): Promise<boolean> {
    try {
      // Primary check: existing success message(s)
      await this.waitForElement(this.successMessage, 3000);
      logger.info('Order placed successfully (successMessage matched)');
      return true;
    } catch {
      // Not found — try alternate indicators
    }

    try {
      const url = this.page.url();
      logger.info(`Post-order URL: ${url}`);
      if (/\/orders|order-confirmation|order\/\d+/i.test(url)) {
        logger.info('Order placed successfully (URL indicates orders page)');
        return true;
      }
    } catch (e) {
      logger.warn(`Could not read page URL: ${e}`);
    }

    // Alternate text selectors that sometimes indicate success
    const alternateSuccessSelectors = [
      'text=Order ID',
      'text=Order #',
      'text=Thank you',
      'text=Order confirmed',
      'text=Your order',
      'text=Order Placed Successfully',
      '[class*="order-success"]',
      '[data-test="order-confirmation"]'
    ];

    for (const sel of alternateSuccessSelectors) {
      try {
        await this.page.waitForSelector(sel, { timeout: 1000 });
        logger.info(`Order placed successfully (matched alternate selector: ${sel})`);
        return true;
      } catch {
        // try next
      }
    }

    logger.warn('Order placement not verified by any success indicator');
    return false;
  }

  async getSuccessMessage(): Promise<string> {
    try {
      const message = await this.getText(this.successMessage);
      logger.info(`Success message: ${message}`);
      return message;
    } catch {
      return '';
    }
  }

  async getErrorMessage(): Promise<string> {
    try {
      const error = await this.getText(this.errorMessage);
      logger.info(`Error message on checkout: ${error}`);
      return error;
    } catch {
      return '';
    }
  }

  // Navigate to Orders page via header and verify an order containing the product
  async goToOrders(): Promise<void> {
    const ordersSelectors = ['button:has-text("ORDERS")', 'button:has-text("Orders")', 'a:has-text("Orders")', 'text=Orders'];
    for (const sel of ordersSelectors) {
      try {
        const locator = this.page.locator(sel).first();
        await locator.waitFor({ state: 'visible', timeout: 2000 });
        logger.info(`Clicking Orders nav: ${sel}`);
        await this.click(sel);
        await this.page.waitForTimeout(1000);
        return;
      } catch {
        // try next
      }
    }
    // fallback: try programmatic navigation to the orders route (SPA hash)
    try {
      logger.info('Orders nav click failed — navigating via location.hash fallback');
      await this.page.evaluate(() => { try { location.hash = '/dashboard/myorders'; } catch {} });
      await this.page.waitForTimeout(1000);
      return;
    } catch {
      // ignore
    }
  }

  async isProductInOrdersList(productName: string): Promise<boolean> {
    try {
      await this.goToOrders();
      // Wait briefly for orders list to load
      await this.page.waitForTimeout(1000);
      // Try multiple common patterns for orders list entries
      const candidates = [
        `text=${productName}`,
        `xpath=//div[contains(.,"${productName}")]`,
        `[class*="orders-list"] >> text=${productName}`,
        `[class*="order-item"] >> text=${productName}`
      ];
      for (const sel of candidates) {
        try {
          await this.page.waitForSelector(sel, { timeout: 3000 });
          logger.info(`Found product in orders list using selector: ${sel}`);
          return true;
        } catch {
          // try next
        }
      }
      logger.warn('Product not found in orders list');
      return false;
    } catch (e) {
      logger.warn(`Could not verify orders list: ${e}`);
      return false;
    }
  }
}
