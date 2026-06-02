import { test, expect, APIRequestContext } from '@playwright/test';
import { APIHelper } from '../../utils/apiHelper';
import { logger } from '../../utils/logger';
import { apiTestData, apiExpectedMessages } from './apiTestData';

test.describe('API Test Cases - Product Search', () => {
  let apiHelper: APIHelper;
  let apiContext: APIRequestContext;
  let authToken: string = '';

  test.beforeAll(async ({ playwright }) => {
    logger.info('========== API Search Test Suite Initialized ==========');
    // Create API request context
    apiContext = await playwright.request.newContext();
    apiHelper = new APIHelper(apiContext);

    // Login to get auth token
    const loginResponse = await apiHelper.login(apiTestData.validUser.email, apiTestData.validUser.password);
    authToken = loginResponse.token;
    apiHelper.setAuthToken(authToken);
    logger.info('✓ Pre-login for search tests completed');
  });

  test.afterAll(async () => {
    // Clean up API context
    await apiContext.dispose();
    logger.info('========== API Search Test Suite Completed ==========');
  });

  test('API_002: Search Invalid Product - Validate Get All Products API Response', async () => {
    logger.test('API_002: Search Invalid Product', 'STARTED');

    try {
      // Step 1: Search for invalid product
      logger.info('Step 1: Searching for invalid product via Get All Products API');
      const invalidProductResponse = await apiHelper.getAllProducts(apiTestData.invalidProduct);
      
      // Validate API response
      expect(invalidProductResponse.status).toBe(200);
      logger.info(`✓ API returned status 200`);
      logger.info(`✓ Response message: ${invalidProductResponse.fullResponse.message}`);

      // Validate that no products are found
      const productsFound = invalidProductResponse.data ? invalidProductResponse.data.length : 0;
      expect(productsFound).toBe(0);
      logger.info(`✓ Correctly returned 0 products for invalid search term`);

      // Step 2: Verify response structure
      logger.info('Step 2: Validating API response structure');
      expect(invalidProductResponse.fullResponse).toBeDefined();
      expect(invalidProductResponse.fullResponse.message).toBeDefined();
      logger.info(`✓ Response structure is valid`);

      // Step 3: Search with valid product to compare
      logger.info('Step 3: Searching for valid product for comparison');
      const validProductResponse = await apiHelper.getAllProducts(apiTestData.validProducts[0].name);
      
      expect(validProductResponse.status).toBe(200);
      const validProductsFound = validProductResponse.data ? validProductResponse.data.length : 0;
      expect(validProductsFound).toBeGreaterThan(0);
      logger.info(`✓ Valid product search returned ${validProductsFound} products`);

      // Final validation
      logger.info('Final Validation:');
      logger.info(`✓ Invalid Product Search: 0 products found`);
      logger.info(`✓ Valid Product Search: ${validProductsFound} products found`);
      logger.info(`✓ API Response: Valid and correctly structured`);

      logger.test('API_002: Search Invalid Product', 'PASSED', {
        invalidProductSearch: productsFound,
        validProductSearch: validProductsFound,
        status: 'Invalid product search validation successful'
      });

    } catch (error) {
      logger.error(`API_002 Failed: ${error.message}`);
      logger.test('API_002: Search Invalid Product', 'FAILED', { error: error.message });
      throw error;
    }
  });
});
