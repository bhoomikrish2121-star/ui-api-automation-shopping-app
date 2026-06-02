import { APIRequestContext, expect } from '@playwright/test';
import { logger } from './logger';

export class APIHelper {
  private context: APIRequestContext;
  private baseURL: string = 'https://rahulshettyacademy.com/api/ecom';
  private authToken: string = '';

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    logger.info(`Auth token set: ${token.substring(0, 20)}...`);
  }

  getAuthToken(): string {
    return this.authToken;
  }

  /**
   * Login API - authenticate user and get auth token
   */
  async login(email: string, password: string): Promise<{ token: string; userId: string; message?: string }> {
    logger.info(`[API] Logging in with email: ${email}`);
    
    const response = await this.context.post(`${this.baseURL}/auth/login`, {
      data: {
        userEmail: email,
        userPassword: password
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const responseBody = await response.json();
    logger.info(`[API] Login response status: ${response.status()}`);

    if (response.status() === 200) {
      this.authToken = responseBody.token;
      logger.info(`✓ Login successful - Token received`);
      return {
        token: responseBody.token,
        userId: responseBody.userId,
        message: 'Login successful'
      };
    } else {
      logger.error(`Login failed with status ${response.status()}: ${JSON.stringify(responseBody)}`);
      return responseBody;
    }
  }

  /**
   * Get All Products API - search products
   */
  async getAllProducts(productName: string = ''): Promise<any> {
    logger.info(`[API] Getting all products - searching for: ${productName}`);

    const response = await this.context.post(`${this.baseURL}/product/get-all-products`, {
      data: {
        productName: productName,
        minPrice: null,
        maxPrice: null,
        productCategory: [],
        productSubCategory: [],
        productFor: []
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authToken,
        'Accept': 'application/json'
      }
    });

    const responseBody = await response.json();
    logger.info(`[API] Get Products response status: ${response.status()}`);
    logger.info(`[API] Products found: ${responseBody.data ? responseBody.data.length : 0}`);

    return {
      status: response.status(),
      data: responseBody.data,
      message: responseBody.message,
      fullResponse: responseBody
    };
  }

  /**
   * Add to Cart API - add product to user cart
   */
  async addToCart(userId: string, productData: any): Promise<any> {
    logger.info(`[API] Adding product to cart for user: ${userId}`);

    const response = await this.context.post(`${this.baseURL}/user/add-to-cart`, {
      data: {
        _id: userId,
        product: productData
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authToken,
        'Accept': 'application/json'
      }
    });

    const responseBody = await response.json();
    logger.info(`[API] Add to Cart response status: ${response.status()}`);

    if (response.status() === 200) {
      logger.info(`✓ Product added to cart successfully`);
    } else {
      logger.error(`Add to cart failed: ${JSON.stringify(responseBody)}`);
    }

    return {
      status: response.status(),
      message: responseBody.message,
      fullResponse: responseBody
    };
  }

  /**
   * Place Order API - create order
   */
  async createOrder(orders: any[]): Promise<any> {
    logger.info(`[API] Creating order with ${orders.length} product(s)`);

    const response = await this.context.post(`${this.baseURL}/order/create-order`, {
      data: {
        orders: orders
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authToken,
        'Accept': 'application/json'
      }
    });

    const responseBody = await response.json();
    logger.info(`[API] Create Order response status: ${response.status()}`);

    if (response.status() === 201) {
      logger.info(`✓ Order created successfully - OrderId: ${responseBody.orders?.[0]}`);
    } else {
      logger.error(`Order creation failed: ${JSON.stringify(responseBody)}`);
    }

    return {
      status: response.status(),
      orderId: responseBody.orders?.[0],
      message: responseBody.message,
      fullResponse: responseBody
    };
  }

  /**
   * Validate API response
   */
  validateResponse(response: any, expectedStatus: number, shouldHaveData: boolean = true): boolean {
    logger.info(`[API] Validating response - Expected status: ${expectedStatus}, Actual: ${response.status}`);
    
    expect(response.status).toBe(expectedStatus);
    
    if (shouldHaveData) {
      expect(response.fullResponse).toBeDefined();
      logger.info('✓ Response validation passed');
    }
    
    return true;
  }
}
