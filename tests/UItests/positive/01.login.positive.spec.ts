import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../utils/loginPage';
import { logger } from '../../../utils/logger';
import { testData } from '../../../config/testData';

test.describe('Positive Test Cases - Login Module', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    logger.info('========== Test Initialized ==========');
  });

  test('TC_P001: Valid Login with correct credentials', async () => {
    logger.test('TC_P001: Valid Login', 'STARTED');
    
    try {
      await loginPage.navigateToLogin();
      logger.info('Login page loaded successfully');

      await loginPage.login(testData.validLogin.email, testData.validLogin.password);
      logger.info('Login credentials submitted');

      // Wait for navigation to dashboard
      await loginPage.page.waitForTimeout(2000);
      
      // Verify successful login by checking if user is logged in
      const isUserLoggedIn = await loginPage.isUserLoggedIn(testData.validLogin.email);
      expect(isUserLoggedIn).toBeTruthy();
      logger.info('✓ Login successful - Dashboard page loaded');
      
      // Verify Sign Out button is visible (indicates logged in user)
      const isSignOutVisible = await loginPage.getLogoutLink();
      expect(isSignOutVisible).toBeTruthy();
      logger.info(`✓ Email ID validated: ${testData.validLogin.email} - Sign Out button visible`);
      
      logger.test('TC_P001: Valid Login', 'PASSED', {
        email: testData.validLogin.email,
        status: 'Successfully logged in'
      });
    } catch (error) {
      logger.error('TC_P001 Failed', { error: error.toString() });
      logger.test('TC_P001: Valid Login', 'FAILED', { error: error.toString() });
      throw error;
    }
  });

  // test('TC_P002: Verify login page elements are present', async () => {
  //   logger.test('TC_P002: Login Page Elements', 'STARTED');
    
  //   try {
  //     await loginPage.navigateToLogin();
      
  //     const isEmailInputVisible = await loginPage.isVisible('input[type="email"]');
  //     const isPasswordInputVisible = await loginPage.isVisible('input[type="password"]');
  //     const isLoginButtonVisible = await loginPage.isVisible('button[type="submit"]');
      
  //     expect(isEmailInputVisible).toBeTruthy();
  //     expect(isPasswordInputVisible).toBeTruthy();
  //     expect(isLoginButtonVisible).toBeTruthy();
      
  //     logger.info('All login page elements are present');
  //     logger.test('TC_P002: Login Page Elements', 'PASSED');
  //   } catch (error) {
  //     logger.error('TC_P002 Failed', { error: error.toString() });
  //     logger.test('TC_P002: Login Page Elements', 'FAILED', { error: error.toString() });
  //     throw error;
  //   }
  // });


});
