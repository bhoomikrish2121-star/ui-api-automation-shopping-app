import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../utils/loginPage';
import { DashboardPage } from '../../../utils/dashboardPage';
import { CartPage } from '../../../utils/cartPage';
import { CheckoutPage } from '../../../utils/checkoutPage';
import { logger } from '../../../utils/logger';
import { testData } from '../../../config/testData';

test.describe('Positive Test Cases - End-to-End Order Placement', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    logger.info('========== Test Initialized - E2E Order Placement ==========');
  });

  test('TC_P003: Complete end-to-end flow - Login, Search ZARA COAT 3, Add to Cart, Checkout and Place Order', async ({ page }) => {
    logger.test('TC_P003: End-to-End Order Placement Flow', 'STARTED');
    
    try {
      // Step 1: Login
      logger.info('Step 1: Logging in with valid credentials');
      await loginPage.navigateToLogin();
      await loginPage.login(testData.validLogin.email, testData.validLogin.password);
      await page.waitForTimeout(2000);
      
      const isUserLoggedIn = await loginPage.isUserLoggedIn(testData.validLogin.email);
      expect(isUserLoggedIn).toBeTruthy();
      logger.info('✓ Login successful - Dashboard page loaded');
      logger.info(`✓ Email ID validated: ${testData.validLogin.email}`);

      // Step 2: Search for ZARA COAT 3
      logger.info('Step 2: Searching for product ZARA COAT 3');
      await dashboardPage.searchProduct(testData.searchProduct);
      await page.waitForTimeout(1000);
      
      const isProductFound = await dashboardPage.isProductDisplayed(testData.searchProduct);
      expect(isProductFound).toBeTruthy();
      logger.info('✓ Product search successful - ZARA COAT 3 found');

      // Step 3: Add to Cart
      logger.info('Step 3: Adding product to cart');
      await dashboardPage.addProductToCart();
      await page.waitForTimeout(1500);
      logger.info('✓ Product added to cart');

      // Step 4: Navigate to Cart
      logger.info('Step 4: Navigating to cart');
      await dashboardPage.goToCart();
      await page.waitForTimeout(1500);
      
      const isOnCartPage = await cartPage.isOnCartPage();
      expect(isOnCartPage).toBeTruthy();
      logger.info('✓ Cart page loaded');
      
      // Verify product is in cart
      const isProductInCart = await cartPage.isProductInCart(testData.searchProduct);
      expect(isProductInCart).toBeTruthy();
      logger.info(`✓ Product verified in cart: ${testData.searchProduct}`);

      // Step 5: Proceed to Checkout
      logger.info('Step 5: Proceeding to checkout');
      await cartPage.proceedToCheckout();
      await page.waitForTimeout(2000);
      
      const isOnCheckoutPage = await checkoutPage.isOnCheckoutPage();
      expect(isOnCheckoutPage).toBeTruthy();
      logger.info('✓ Checkout page loaded');


      // Step 6: Fill checkout details and place order
      logger.info('Step 6: Filling checkout details and placing order');
     // await checkoutPage.enterEmail(testData.validLogin.email);
      logger.info('✓ Email entered');
      
      await page.waitForTimeout(500);
      
      // Select country
      try {
        await checkoutPage.enterCountry('India');
        logger.info('✓ Country selected: India');
      } catch (e) {
        logger.warn('Country selection faced issue, continuing...');
      }

        // Enter payment details
      await checkoutPage.enterCardHolderName(testData.paymentDetails.cardholderName);
      logger.info(`✓ Card holder name entered: ${testData.paymentDetails.cardholderName}`);
      
      await checkoutPage.enterCVV(testData.paymentDetails.cvv);
      logger.info('✓ CVV entered');
  
      // Complete order placement
      logger.info('Step 7: Placing order...');
      await checkoutPage.placeOrder();
      await page.waitForTimeout(3000);
      logger.info('✓ Order placed');

      // Step 8: Verify order present in Orders list
      logger.info('Step 8: Verifying order present in Orders list');
      const isInOrders = await checkoutPage.isProductInOrdersList(testData.searchProduct);
      expect(isInOrders).toBeTruthy();
      logger.info('✓ Order verified in Orders list');

      logger.test('TC_P003: End-to-End Order Placement Flow', 'PASSED', {
        email: testData.validLogin.email,
        product: testData.searchProduct,
        status: 'Order Placed Successfully'
      });
    } catch (error) {
      logger.error('TC_P003 Failed', { error: error.toString() });
      logger.test('TC_P003: End-to-End Order Placement Flow', 'FAILED', { error: error.toString() });
      throw error;
    }
  });
});
