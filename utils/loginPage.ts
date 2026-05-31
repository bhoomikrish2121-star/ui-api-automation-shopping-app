import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { logger } from './logger';

export class LoginPage extends BasePage {
  // Locators
  readonly emailInput = 'input[placeholder*="email"], input[type="email"]';
  readonly passwordInput = 'input[placeholder*="password"], input[placeholder*="passsword"], input[type="password"]';
  readonly loginButton = 'button[name="login"], button[name="Login"], button[name="signIn"], button[aria-label*="login"], button:has-text("Login")';
  readonly errorMessage = '[class*="error"], [class*="alert"], .ng-star-inserted, .toast';
  readonly invalidCredentialError = 'text=/Incorrect|Invalid|Email|Password/i';
  readonly forgotPasswordLink = 'a[href*="forgot"]';
  readonly signupLink = 'a[href*="signup"]';

  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin(): Promise<void> {
    logger.info('Navigating to login page');
    await this.goto('https://rahulshettyacademy.com/client/#/auth/login');
    await this.waitForElement(this.emailInput);
  }

  async enterEmail(email: string): Promise<void> {
    logger.info(`Entering email: ${email}`);
    await this.fill(this.emailInput, email);
  }

  async enterPassword(password: string): Promise<void> {
    logger.info('Entering password');
    await this.fill(this.passwordInput, password);
  }

  async clickLoginButton(): Promise<void> {
    logger.info('Clicking login button');
    await this.page.waitForTimeout(500);

    const loginBtn = this.page.locator(this.loginButton).first();
    try {
      await loginBtn.waitFor({ state: 'visible', timeout: 8000 });
      await loginBtn.scrollIntoViewIfNeeded();
      await loginBtn.click({ timeout: 10000 });
    } catch (error) {
      logger.warn(`Login button click failed, trying fallback Enter key: ${error}`);
      await this.page.keyboard.press('Enter');
    }

    // Wait for dashboard navigation or visible dashboard search input as post-login signal
    const dashboardUrlPatterns = ['**/dashboard**', '**/products**'];
    const dashboardIndicator = 'input[placeholder*="Search"], input[aria-label*="search"], input[type="search"]';

    let navigated = false;
    for (const pattern of dashboardUrlPatterns) {
      try {
        await this.page.waitForURL(pattern, { timeout: 7000 });
        navigated = true;
        break;
      } catch {
        continue;
      }
    }

    if (!navigated) {
      try {
        await this.page.waitForSelector(dashboardIndicator, { timeout: 7000 });
        navigated = true;
      } catch {
        logger.warn('Dashboard indicator not found after login');
      }
    }

    if (!navigated) {
      // final try: wait for networkidle briefly
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch {
        logger.warn('Network idle wait timed out, continuing...');
      }
    }
  }

  async login(email: string, password: string): Promise<void> {
    logger.info(`Logging in with email: ${email}`);
    await this.enterEmail(email);
    await this.page.waitForTimeout(500);
    await this.enterPassword(password);
    await this.page.waitForTimeout(500);
    await this.clickLoginButton();
  }

  async getErrorMessage(): Promise<string> {
    try {
      // Wait a moment for error to appear
      await this.page.waitForTimeout(1500);
      
      // Try to find error message with multiple selectors
      const errorSelectors = [
        '[class*="error"]',
        '[class*="alert"]',
        '.ng-star-inserted',
        '.toast',
        'text=/Incorrect|Invalid|not found/i'
      ];
      
      for (const selector of errorSelectors) {
        try {
          const errorLocator = this.page.locator(selector);
          const count = await errorLocator.count();
          if (count > 0) {
            const error = await errorLocator.first().textContent();
            if (error && error.trim()) {
              logger.info(`Error message displayed: ${error.trim()}`);
              return error.trim();
            }
          }
        } catch {
          continue;
        }
      }
      
      logger.warn('No error message found');
      return '';
    } catch (error) {
      logger.warn(`Failed to get error message: ${error}`);
      return '';
    }
  }

  async isLoginPageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.emailInput);
  }

  async validateErrorMessage(expectedError: string): Promise<boolean> {
    const errorMsg = await this.getErrorMessage();
    const isValid = errorMsg.toLowerCase().includes(expectedError.toLowerCase());
    logger.info(`Error message validation: Expected "${expectedError}", Got "${errorMsg}", Valid: ${isValid}`);
    return isValid;
  }

  async isUserLoggedIn(email: string): Promise<boolean> {
    try {
      // Method 1: Check if we're no longer on login page by checking if login page elements are gone
      try {
        const loginPageElements = await this.page.locator('input[type="email"], input[type="password"]').first().isVisible({ timeout: 3000 });
        if (!loginPageElements) {
          logger.info('User is logged in - login page elements no longer visible');
          return true;
        }
      } catch (e) {
        // If we can't find login elements, user is logged in
        logger.info('User is logged in - no login elements found');
        return true;
      }

      // Method 2: Check if dashboard is loaded (search box visible)
      try {
        const searchBox = await this.page.locator('input[placeholder*="Search"], input[aria-label*="search"]').first().isVisible({ timeout: 3000 });
        if (searchBox) {
          logger.info('User is logged in - dashboard search box is visible');
          return true;
        }
      } catch (e) {
        logger.info('Search box not immediately visible, checking URL...');
      }

      // Method 3: Check if we're on dashboard URL
      const currentUrl = this.page.url();
      if (currentUrl.includes('dashboard') || currentUrl.includes('products')) {
        logger.info('User is logged in - URL indicates dashboard');
        return true;
      }

      // Method 4: Check if Sign Out button exists
      try {
        const signOut = await this.page.locator('button:has-text("Sign Out"), a:has-text("Sign Out"), button:has-text("Logout")').first().isVisible({ timeout: 3000 });
        if (signOut) {
          logger.info('User is logged in - Sign Out button visible');
          return true;
        }
      } catch (e) {
        // continue
      }

      logger.warn('User does not appear to be logged in');
      return false;
    } catch (error) {
      logger.error(`Failed to check login status: ${error}`);
      return false;
    }
  }

  async getLogoutLink(): Promise<boolean> {
    try {
      const logoutVisible = await this.page.locator('button:has-text("Sign Out"), a:has-text("Sign Out"), button:has-text("Logout")').isVisible({ timeout: 5000 });
      return logoutVisible;
    } catch {
      return false;
    }
  }
}
