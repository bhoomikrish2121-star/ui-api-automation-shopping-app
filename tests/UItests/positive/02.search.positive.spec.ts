import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../utils/loginPage';
import { DashboardPage } from '../../../utils/dashboardPage';
import { logger } from '../../../utils/logger';
import { testData } from '../../../config/testData';

test.describe('Positive Test Cases - Search and Add to Cart', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    logger.info('========== Test Initialized ==========');
    
    // Login before test
    await loginPage.navigateToLogin();
    await loginPage.login(testData.validLogin.email, testData.validLogin.password);
    await page.waitForTimeout(2000);
    logger.info('✓ User logged in successfully');
  });

  test('TC_P002: Search product "ZARA COAT 3" and add to cart', async ({ page }) => {
    logger.test('TC_P002: Search and Add to Cart - ZARA COAT 3', 'STARTED');
    
    try {
      // Verify we're on the dashboard
      const isOnDashboard = await dashboardPage.isOnDashboard();
      expect(isOnDashboard).toBeTruthy();
      logger.info('✓ Dashboard loaded successfully');

      // Search for product
      await dashboardPage.searchProduct(testData.searchProduct);
      logger.info(`✓ Searched for product: ${testData.searchProduct}`);
      
      await page.waitForTimeout(1500);

      // Verify product is displayed
      const isProductFound = await dashboardPage.isProductDisplayed(testData.searchProduct);
      expect(isProductFound).toBeTruthy();
      logger.info(`✓ Product "${testData.searchProduct}" found in search results`);

      // Add product to cart
      await dashboardPage.addProductToCart();
      logger.info('✓ Product added to cart');
      
      await page.waitForTimeout(1000);
      
      logger.test('TC_P002: Search and Add to Cart - ZARA COAT 3', 'PASSED', {
        product: testData.searchProduct,
        status: 'Product found and added to cart'
      });
    } catch (error) {
      logger.error('TC_P002 Failed', { error: error.toString() });
      logger.test('TC_P002: Search and Add to Cart - ZARA COAT 3', 'FAILED', { error: error.toString() });
      throw error;
    }
  });
});

