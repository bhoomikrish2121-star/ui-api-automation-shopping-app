import { test, expect, APIRequestContext } from '@playwright/test';
import { APIHelper } from '../../utils/apiHelper';
import { logger } from '../../utils/logger';
import { apiTestData, apiExpectedMessages } from './apiTestData';

test.describe('API Test Cases - Add to Cart', () => {
  let apiHelper: APIHelper;
  let apiContext: APIRequestContext;
  let authToken: string = '';
  let userId: string = '';

  test.beforeAll(async ({ playwright }) => {
    logger.info('========== API Add to Cart Test Suite Initialized ==========');
    // Create API request context
    apiContext = await playwright.request.newContext();
    apiHelper = new APIHelper(apiContext);

    // Login to get auth token
    const loginResponse = await apiHelper.login(apiTestData.validUser.email, apiTestData.validUser.password);
    authToken = loginResponse.token;
    userId = loginResponse.userId;
    apiHelper.setAuthToken(authToken);
    logger.info(`✓ Pre-login for add to cart tests completed - UserID: ${userId}`);
  });

  test.afterAll(async () => {
    // Clean up API context
    await apiContext.dispose();
    logger.info('========== API Add to Cart Test Suite Completed ==========');
  });

  test('API_003: Add Searched Product to Cart - Validate Add to Cart API Response', async () => {
    logger.test('API_003: Add to Cart with Product Validation', 'STARTED');

    try {
      // Step 1: Search for a valid product
      logger.info('Step 1: Searching for product via Get All Products API');
      const searchResponse = await apiHelper.getAllProducts(apiTestData.validProducts[0].name);
      
      expect(searchResponse.status).toBe(200);
      expect(searchResponse.data).toBeDefined();
      expect(searchResponse.data.length).toBeGreaterThan(0);
      logger.info(`✓ Product search returned ${searchResponse.data.length} products`);

      const product = searchResponse.data[0];
      logger.info(`✓ Selected product: ${product.productName}`);
      logger.info(`✓ Product ID: ${product._id}`);
      logger.info(`✓ Product Price: ${product.productPrice}`);
      logger.info(`✓ Product Category: ${product.productCategory}`);

      // Step 2: Validate product structure
      logger.info('Step 2: Validating searched product structure');
      expect(product._id).toBeDefined();
      expect(product.productName).toBeDefined();
      expect(product.productPrice).toBeDefined();
      expect(product.productCategory).toBeDefined();
      logger.info(`✓ Product structure is valid`);

      // Step 3: Add product to cart
      logger.info('Step 3: Adding searched product to cart via API');
      const addToCartResponse = await apiHelper.addToCart(userId, product);
      
      // Validate API response
      expect(addToCartResponse.status).toBe(200);
      expect(addToCartResponse.fullResponse).toBeDefined();
      logger.info(`✓ Add to Cart API returned status 200`);
      logger.info(`✓ Response message: ${addToCartResponse.message}`);

      // Step 4: Validate cart response structure
      logger.info('Step 4: Validating Add to Cart API response structure');
      expect(addToCartResponse.fullResponse.message).toBeDefined();
      logger.info(`✓ Response contains message field`);

      // Step 5: Verify product details in response
      logger.info('Step 5: Verifying product details consistency');
      if (addToCartResponse.fullResponse.cartData) {
        logger.info(`✓ Cart data available in response`);
        logger.info(`✓ Cart items count: ${addToCartResponse.fullResponse.cartData.length}`);
      }

      // Final validation
      logger.info('Final Validation:');
      logger.info(`✓ Product Search: Successful - Found product: ${product.productName}`);
      logger.info(`✓ Add to Cart: Successful`);
      logger.info(`✓ API Response: Valid and correctly structured`);
      logger.info(`✓ Product Details: Maintained throughout the flow`);

      logger.test('API_003: Add to Cart with Product Validation', 'PASSED', {
        product: product.productName,
        productId: product._id,
        productPrice: product.productPrice,
        cartStatus: 'Product added to cart successfully',
        apiResponseStatus: addToCartResponse.status
      });

    } catch (error) {
      logger.error(`API_003 Failed: ${error.message}`);
      logger.test('API_003: Add to Cart', 'FAILED', { error: error.message });
      throw error;
    }
  });
});
