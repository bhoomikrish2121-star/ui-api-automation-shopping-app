export const testData = {
  // Valid credentials
  validLogin: {
    email: 'preetics05@gmail.com',
    password: 'Test@1234'
  },

  // Invalid credentials for negative testing
  invalidCredentials: [
    {
      email: 'invalid@test.com',
      password: 'wrongpassword',
      description: 'Invalid email and password',
      expectedMessage: 'Incorrect email or password'
    },
    {
      email: 'practice@automation.com',
      password: 'wrongpassword',
      description: 'Valid email with wrong password',
      expectedMessage: 'Incorrect email or password'
    },
    {
      email: 'nonexistent@test.com',
      password: 'Test@123',
      description: 'Non-existent email',
      expectedMessage: 'Incorrect email or password'
    }
  ],

  // Product search data
  searchProduct: 'ZARA COAT 3',

  // Payment details for checkout
  paymentDetails: {
    cardholderName: 'Preeti Sharma',
    cvv: '123'
  },

  // Wait times (in milliseconds)
  waits: {
    short: 500,
    medium: 2000,
    long: 5000,
    veryllong: 10000
  },

  // URLs
  baseUrl: 'https://rahulshettyacademy.com/client/',
  loginUrl: 'https://rahulshettyacademy.com/client/#/auth/login',

  // UI Elements timeouts
  elementTimeout: 10000,
  navigationTimeout: 30000
};

export const expectedMessages = {
  loginSuccess: 'Dashboard',
  invalidCredentials: 'Incorrect email or password',
  productFound: 'ADIDAS ORIGINAL',
  addToCartSuccess: 'added to your cart',
  checkoutSuccess: 'Order placed successfully'
};
