export const apiTestData = {
  // Valid credentials
  validUser: {
    email: 'preetics05@gmail.com',
    password: 'Test@1234'
  },

  // Invalid product for negative testing
  invalidProduct: 'NONEXISTENT_PRODUCT_XYZ',

  // Valid products
  validProducts: [
    {
      name: 'ADIDAS ORIGINAL',
      id: '6960eae1c941646b7a8b3ed3',
      category: 'electronics',
      subCategory: 'mobiles',
      price: 11500
    },
    {
      name: 'ZARA COAT 3',
      category: 'fashion'
    }
  ],

  // Countries for order
  countries: [
    'India',
    'United States',
    'United Kingdom'
  ],

  // Timeouts
  timeout: {
    short: 5000,
    medium: 10000,
    long: 30000
  }
};

export const apiExpectedMessages = {
  loginSuccess: 'Login successful',
  productFound: 'Product Found',
  addToCartSuccess: 'Added To Cart',
  orderCreated: 'Order Placed Successfully'
};
