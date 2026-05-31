import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../utils/loginPage';
import { DashboardPage } from '../../../utils/dashboardPage';
import { BasePage } from '../../../utils/basePage';
import { logger } from '../../../utils/logger';
import { testData } from '../../../config/testData';

test.describe('Negative Test Cases - Search Module', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    basePage = new BasePage(page);
    logger.info('========== Test Initialized ==========');

    // Step 1: Navigate to login page
    await loginPage.navigateToLogin();
    await page.waitForTimeout(2000);

    // Step 2: Login with valid credentials
    logger.info('Logging in with valid credentials');
      await loginPage.enterEmail(testData.validLogin.email);
      await loginPage.enterPassword(testData.validLogin.password);
    await loginPage.clickLoginButton();

    // Wait for dashboard to load
    await page.waitForTimeout(3000);
    logger.info('✓ Logged in successfully');
  });

  test('TC_N002: Search for Invalid Product - No Results Found', async ({ page }) => {
    logger.test('TC_N002: Search Invalid Product', 'STARTED');

    try {
      // Step 1: Search for invalid product (XXX)
      logger.info('Step 1: Searching for invalid product "XXX"');
      await dashboardPage.searchProduct('XXX');
      logger.info('✓ Search for invalid product completed');

      // Step 2: Wait for search results to load
      logger.info('Step 2: Waiting for search results');
      await page.waitForTimeout(2000);

      // Step 3: Validate that no products are displayed
      logger.info('Step 3: Validating no results found');

      const noResultsSelectors = [
        'text=/no result|no product|not found|no items/i',
        '[class*="no-data"]',
        '[class*="empty"]',
        '[class*="not-found"]',
        'div:has-text("No Result")',
        'div:has-text("No Products")'
      ];

      let noResultsMessageFound = false;

      for (const selector of noResultsSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 3000 })) {
            const text = await element.textContent();
            logger.info(`✓ No results message found: ${text?.trim()}`);
            noResultsMessageFound = true;
            break;
          }
        } catch {
          // Continue to next selector
        }
      }

      // Alternative check: Verify product list is empty
      if (!noResultsMessageFound) {
        const products = await page.locator('[class*="card"]').count();
        logger.info(`Products found on page: ${products}`);

        if (products === 0) {
          logger.info('✓ No products displayed on page');
          noResultsMessageFound = true;
        }
      }

      // Validate that the search box still contains our search term
      const searchBox = await page.inputValue('input[placeholder*="search"], input[type="search"]').catch(() => '');
      if (searchBox === 'XXX') {
        logger.info('✓ Search box contains search term: XXX');
      }

      const hasNoProducts = noResultsMessageFound || (await page.locator('[class*="card"]').count()) === 0;
      if (!hasNoProducts) {
        // Last resort: check if we have < 1 product displayed
        const visibleProducts = await page.locator('text=/zara|iphone|adidas|shirt/i').count();
        expect(visibleProducts === 0).toBeTruthy();
      } else {
        expect(hasNoProducts).toBeTruthy();
      }
      logger.info('✓ Invalid product search validation passed - no results displayed');

      logger.test('TC_N002: Search Invalid Product', 'PASSED', {
        searchTerm: 'XXX',
        status: 'No results found as expected'
      });
    } catch (error) {
      logger.error('TC_N002 Failed');
      logger.test('TC_N002: Search Invalid Product', 'FAILED', { error: error.message });
      throw error;
    }
  });
});
