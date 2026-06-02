import { test, expect, APIRequestContext } from '@playwright/test';
import { APIHelper } from '../../utils/apiHelper';
import { logger } from '../../utils/logger';
import { apiTestData, apiExpectedMessages } from './apiTestData';

test.describe('API Test Cases - E2E Flow', () => {
  let apiHelper: APIHelper;
  let apiContext: APIRequestContext;
  let authToken: string = '';
  let userId: string = '';

  test.beforeAll(async ({ playwright }) => {
    logger.info('========== API Test Suite Initialized ==========');
    // Create API request context
    apiContext = await playwright.request.newContext();
    apiHelper = new APIHelper(apiContext);
  });

  test.afterAll(async () => {
    // Clean up API context
    await apiContext.dispose();
    logger.info('========== API Test Suite Completed ==========');
  });

  test('API_001: E2E Flow - Login → Get Products → Add to Cart → Create Order', async () => {
    logger.test('API_001: E2E Flow - Login → Get Products → Add to Cart → Create Order', 'STARTED');

    try {
      // Step 1: Login
      logger.info('Step 1: Login via API');
      const loginResponse = await apiHelper.login(apiTestData.validUser.email, apiTestData.validUser.password);
      
      expect(loginResponse.token).toBeDefined();
      expect(loginResponse.userId).toBeDefined();
      authToken = loginResponse.token;
      userId = loginResponse.userId;
      apiHelper.setAuthToken(authToken);
      logger.info(`✓ Login successful - Token: ${authToken.substring(0, 20)}...`);
      logger.info(`✓ User ID: ${userId}`);

      // Step 2: Get all products
      logger.info('Step 2: Get all products via API');
      const productsResponse = await apiHelper.getAllProducts(apiTestData.validProducts[0].name);
      
      expect(productsResponse.status).toBe(200);
      expect(productsResponse.data).toBeDefined();
      expect(productsResponse.data.length).toBeGreaterThan(0);
      
      const product = productsResponse.data[0];
      logger.info(`✓ Products retrieved - Found ${productsResponse.data.length} products`);
      logger.info(`✓ First product: ${product.productName} - Price: ${product.productPrice}`);

      // Step 3: Add product to cart
      logger.info('Step 3: Add product to cart via API');
      const addToCartResponse = await apiHelper.addToCart(userId, product);
      
      expect(addToCartResponse.status).toBe(200);
      logger.info(`✓ Product added to cart - Response: ${addToCartResponse.message}`);

      // Step 4: Create order
      logger.info('Step 4: Create order via API');
      const orderResponse = await apiHelper.createOrder([{
        country: apiTestData.countries[0],
        productOrderedId: product._id
      }]);
      
      expect(orderResponse.status).toBe(201);
      expect(orderResponse.orderId).toBeDefined();
      logger.info(`✓ Order created successfully - OrderId: ${orderResponse.orderId}`);

      // Final validation
      logger.info('Final Validation:');
      logger.info(`✓ Login: Successful`);
      logger.info(`✓ Product Search: Found ${productsResponse.data.length} products`);
      logger.info(`✓ Add to Cart: Successful`);
      logger.info(`✓ Order Creation: Successful`);

      logger.test('API_001: E2E Flow', 'PASSED', {
        email: apiTestData.validUser.email,
        product: product.productName,
        orderId: orderResponse.orderId,
        status: 'E2E flow completed successfully'
      });

    } catch (error) {
      logger.error(`API_001 Failed: ${error.message}`);
      logger.test('API_001: E2E Flow', 'FAILED', { error: error.message });
      throw error;
    }
  });
});
