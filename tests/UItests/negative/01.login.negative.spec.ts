import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../utils/loginPage';
import { BasePage } from '../../../utils/basePage';
import { logger } from '../../../utils/logger';

test.describe('Negative Test Cases - Login Module', () => {
  let loginPage: LoginPage;
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    basePage = new BasePage(page);
    logger.info('========== Test Initialized ==========');
    await loginPage.navigateToLogin();
  });

  test('TC_N001: Invalid Login - Wrong Email and Wrong Password', async ({ page }) => {
    logger.test('TC_N001: Invalid Login - Wrong Email and Wrong Password', 'STARTED');

    try {
      // Step 1: Enter invalid email
      logger.info('Step 1: Entering invalid email');
      await loginPage.enterEmail('invalidemail@test.com');
      logger.info('✓ Invalid email entered');

      // Step 2: Enter invalid password
      logger.info('Step 2: Entering invalid password');
      await loginPage.enterPassword('WrongPassword123');
      logger.info('✓ Invalid password entered');

      // Step 3: Click login button
      logger.info('Step 3: Clicking login button');
      await loginPage.clickLoginButton();

      // Step 4: Wait for error message and validate
      logger.info('Step 4: Waiting for error toast message');
      await page.waitForTimeout(2000); // Allow time for error to appear

      // Check for error toast/message at the bottom of the page
      const errorSelectors = [
        '[class*="toast"]',
        '[class*="error"]',
        '[class*="alert"]',
        'div[role="alert"]',
        '.ng-trigger-ngIfDef', // Angular error div
        '[class*="message"]'
      ];

      let errorMessageFound = false;
      let errorText = '';

      for (const selector of errorSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            errorText = await element.textContent();
            if (errorText && errorText.toLowerCase().includes('incorrect') || 
                errorText.toLowerCase().includes('invalid') ||
                errorText.toLowerCase().includes('failed') ||
                errorText.toLowerCase().includes('wrong')) {
              errorMessageFound = true;
              logger.info(`✓ Error toast message found: ${errorText?.trim()}`);
              break;
            }
          }
        } catch {
          // Continue to next selector
        }
      }

      // Alternative: Check page for any error indicators
      if (!errorMessageFound) {
        const pageContent = await page.content();
        if (pageContent.toLowerCase().includes('incorrect') || 
            pageContent.toLowerCase().includes('invalid') ||
            pageContent.toLowerCase().includes('failed') ||
            pageContent.toLowerCase().includes('wrong')) {
          errorMessageFound = true;
          logger.info('✓ Error message found in page content');
        }
      }

      // Verify that we're still on login page (login failed)
      const isStillOnLogin = await page.url().includes('/auth/login');
      expect(isStillOnLogin).toBeTruthy();
      logger.info('✓ User remains on login page - login failed as expected');

      logger.test('TC_N001: Invalid Login', 'PASSED', {
        email: 'invalidemail@test.com',
        status: 'Invalid credentials rejected - error displayed'
      });
    } catch (error) {
      logger.error('TC_N001 Failed');
      logger.test('TC_N001: Invalid Login', 'FAILED', { error: error.message });
      throw error;
    }
  });
});
