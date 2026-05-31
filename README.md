# UI Automation Shopping App - Playwright

Comprehensive Playwright automation suite for testing shopping application UI flows with positive and negative test cases.

## 📋 Project Overview

This project automates end-to-end UI testing for the shopping application at **https://rahulshettyacademy.com/client/**

### Test Coverage
- **6 Positive Test Cases** - Validate successful user flows
- **3 Negative Test Cases** - Validate error handling and edge cases
- **Comprehensive Logging** - Detailed test execution logs
- **Test Reports** - HTML, JSON, and JUnit report formats

---

## 📁 Project Structure

```
ui-api-autoamiton-shopping-app/
├── tests/
│   └── UItests/
│       ├── positive/
│       │   ├── 01.login.positive.spec.ts
│       │   ├── 02.search.positive.spec.ts
│       │   ├── 03.addToCart.positive.spec.ts
│       │   ├── 04.cartOperations.positive.spec.ts
│       │   ├── 05.checkout.positive.spec.ts
│       │   └── 06.endToEnd.positive.spec.ts
│       └── negative/
│           ├── 01.login.negative.spec.ts
│           └── 02.searchAndCart.negative.spec.ts
├── utils/
│   ├── logger.ts           # Logging utility
│   ├── basePage.ts         # Base page object model
│   ├── loginPage.ts        # Login page POM
│   ├── dashboardPage.ts    # Dashboard page POM
│   ├── cartPage.ts         # Cart page POM
│   └── checkoutPage.ts     # Checkout page POM
├── config/
│   └── testData.ts         # Test data and configurations
├── reports/
│   └── logs/               # Test execution logs
├── playwright.config.ts    # Playwright configuration
├── package.json           # NPM dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

---

## 🧪 Test Cases

### Positive Test Cases (6)

| ID | Test Case | Description |
|---|---|---|
| TC_P001 | Valid Login | Login with correct credentials |
| TC_P002 | Login Page Elements | Verify all login page elements are present |
| TC_P003 | Login Page Title & URL | Verify correct page title and URL |
| TC_P004 | Search Product | Search for 'IPHONE' and verify it's displayed |
| TC_P005 | Search Results | Verify search results are populated correctly |
| TC_P006 | Add to Cart | Add 'IPHONE' product to cart successfully |
| TC_P007 | Verify in Cart | Verify product appears in cart after adding |
| TC_P008 | Cart Page Display | Verify cart page loads and displays items |
| TC_P009 | Checkout Button | Verify checkout button is visible and clickable |
| TC_P010 | Navigate to Checkout | Navigate to checkout page successfully |
| TC_P011 | Checkout Elements | Verify all checkout page elements are present |
| TC_P012 | End-to-End Flow | Complete flow: Login → Search → Add Cart → Checkout → Order |

### Negative Test Cases (3)

| ID | Test Case | Description |
|---|---|---|
| TC_N001 | Invalid Credentials | Login with invalid email and password |
| TC_N002 | Valid Email Wrong Password | Login with valid email but wrong password |
| TC_N003 | Non-Existent Email | Login with non-existent email |
| TC_N004 | Search Non-Existent Product | Search for non-existent product |
| TC_N005 | Empty Cart Checkout | Attempt checkout with empty cart |
| TC_N006 | Invalid Session Access | Verify logout and session invalidation |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. **Navigate to project directory:**
   ```bash
   cd ui-api-autoamiton-shopping-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This installs:
   - `@playwright/test` - Playwright testing framework
   - `typescript` - TypeScript support
   - Other dependencies for test reporting

---

## 📝 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in UI Mode (Visual Debugging)
```bash
npm run test:ui
```

### Run Tests in Headed Mode
```bash
npm run test:headed
```

### Run Tests with Debug
```bash
npm run test:debug
```

### Run Only Positive Tests
```bash
npm run test:positive
```

### Run Only Negative Tests
```bash
npm run test:negative
```

### View Test Report
```bash
npm run test:report
```

---

## 📊 Test Reports

Reports are generated in the `reports/` directory in multiple formats:

### Report Types
- **HTML Report** - `reports/html-report/` - Interactive visual report
- **JSON Report** - `reports/results.json` - Machine-readable results
- **JUnit Report** - `reports/junit-results.xml` - CI/CD integration
- **Test Logs** - `reports/logs/` - Detailed execution logs

### Accessing Reports

#### HTML Report
```bash
npm run test:report
```
Opens an interactive HTML report in your browser showing:
- Test results summary
- Pass/fail status
- Screenshots on failure
- Video recordings

#### Console Report
Test results are printed to console with pass/fail indicators.

---

## 🔧 Configuration

### Playwright Configuration (`playwright.config.ts`)

Key configurations:
- **Base URL:** https://rahulshettyacademy.com/client/
- **Timeout:** 30 seconds for navigation
- **Retries:** 2 retries on CI, 0 on local
- **Screenshot:** On failure only
- **Video:** Retained on failure
- **Browser:** Chromium

### Test Data (`config/testData.ts`)

Default test credentials:
```typescript
validLogin: {
  email: 'practice@automation.com',
  password: 'Test@123'
}

searchProduct: 'IPHONE'
```

---

## 📚 Page Object Model (POM)

### Structure
All page objects inherit from `BasePage` class with common utilities:

```
BasePage (utils/basePage.ts)
├── LoginPage (utils/loginPage.ts)
├── DashboardPage (utils/dashboardPage.ts)
├── CartPage (utils/cartPage.ts)
└── CheckoutPage (utils/checkoutPage.ts)
```

### Example Usage
```typescript
const loginPage = new LoginPage(page);
await loginPage.navigateToLogin();
await loginPage.login(email, password);
```

---

## 📋 Logging

### Logger Utility (`utils/logger.ts`)

Comprehensive logging system that captures:
- **INFO** - General information messages
- **ERROR** - Error occurrences
- **WARN** - Warning messages
- **DEBUG** - Debug information
- **TEST** - Test execution status

### Log Location
Logs are saved to: `reports/logs/test-{timestamp}.log`

### Log Output Example
```
[2024-05-29T10:30:45.123Z] [INFO] Navigating to: https://rahulshettyacademy.com/client/#/auth/login
[2024-05-29T10:30:48.456Z] [INFO] Logging in with email: practice@automation.com
[2024-05-29T10:30:51.789Z] [TEST] TC_P001: Valid Login - PASSED
```

---

## 🎯 Key Features

### ✅ Complete Test Coverage
- Login scenarios (valid/invalid credentials)
- Product search functionality
- Add to cart operations
- Cart management
- Checkout process
- End-to-end order placement

### ✅ Comprehensive Logging
- Test execution logs with timestamps
- Error logging with stack traces
- Test status tracking
- Screenshot capture on failures
- Video recording on failures

### ✅ Professional Reports
- Multiple report formats (HTML, JSON, JUnit)
- Visual test report with screenshots
- Video playback of failed tests
- Summary statistics

### ✅ Best Practices
- Page Object Model pattern
- Base page utilities
- Centralized test data
- TypeScript support
- Retry mechanism for flaky tests

---

## 🛠️ Troubleshooting

### Issue: Tests Fail to Connect
**Solution:** Verify the base URL is correct and the application is accessible.

### Issue: Timeouts Occur
**Solution:** Increase timeout values in `playwright.config.ts` or specific test files.

### Issue: Selector Not Found
**Solution:** Update selectors in page object files based on current UI elements.

### Issue: Reports Not Generated
**Solution:** Check `reports/` directory has write permissions and disk space is available.

---

## 📞 Support & Maintenance

For issues or improvements:
1. Review test logs in `reports/logs/`
2. Check HTML report for visual insights
3. Update selectors if UI has changed
4. Review Playwright documentation: https://playwright.dev/

---

## 📄 License

This project is for testing purposes. Modify and use as needed for your requirements.

---

## 🚀 Future Enhancements

- [ ] API integration tests
- [ ] Performance testing
- [ ] Visual regression testing
- [ ] Cross-browser testing (Firefox, Safari)
- [ ] Parallel test execution
- [ ] CI/CD integration (GitHub Actions, Jenkins)
- [ ] Email notification for test results

---

**Last Updated:** May 29, 2024
**Version:** 1.0.0
