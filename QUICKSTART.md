# 🚀 Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies (if not done)
```bash
npm install
```

### Step 2: Run All Tests
```bash
npm test
```

### Step 3: View Report
```bash
npm run test:report
```

---

## Common Commands Reference

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests |
| `npm run test:ui` | Run tests with UI (visual mode) |
| `npm run test:headed` | Run with browser visible |
| `npm run test:debug` | Debug mode |
| `npm run test:positive` | Run only positive tests |
| `npm run test:negative` | Run only negative tests |
| `npm run test:report` | View HTML report |

---

## Test Files Location

```
tests/UItests/
├── positive/
│   ├── 01.login.positive.spec.ts          (3 test cases)
│   ├── 02.search.positive.spec.ts         (2 test cases)
│   ├── 03.addToCart.positive.spec.ts      (2 test cases)
│   ├── 04.cartOperations.positive.spec.ts (2 test cases)
│   ├── 05.checkout.positive.spec.ts       (2 test cases)
│   └── 06.endToEnd.positive.spec.ts       (1 test case - E2E)
└── negative/
    ├── 01.login.negative.spec.ts          (3 test cases)
    └── 02.searchAndCart.negative.spec.ts  (3 test cases)
```

**Total: 18 Test Cases (12 Positive + 6 Negative)**

---

## Test Scenarios Covered

### Login Tests
- ✅ Valid login with correct credentials
- ✅ Verify login page elements
- ✅ Verify login page title and URL
- ❌ Invalid email and password
- ❌ Valid email with wrong password
- ❌ Non-existent email

### Search Tests
- ✅ Search product "IPHONE" and verify
- ✅ Verify search results are populated
- ❌ Search non-existent product

### Cart Tests
- ✅ Add product to cart
- ✅ Verify product in cart
- ✅ Verify cart page loads
- ✅ Verify checkout button
- ❌ Attempt checkout with empty cart

### Checkout Tests
- ✅ Navigate to checkout page
- ✅ Verify checkout elements

### End-to-End Tests
- ✅ Complete flow: Login → Search → Add Cart → Checkout → Order

---

## Credentials for Testing

```
Email:    practice@automation.com
Password: Test@123
```

---

## Project Features

### 📝 Logging
- All test actions logged with timestamps
- Logs saved in: `reports/logs/`
- Each test run creates a new log file

### 📸 Screenshots
- Automatically captured on test failures
- Saved in: `reports/screenshots/`
- Visible in HTML report

### 🎥 Video Recording
- Videos of failed tests recorded
- Saved in: `reports/videos/`
- Playable in HTML report

### 📊 Reports
- **HTML Report**: Interactive visual report with charts
- **JSON Report**: Machine-readable format for CI/CD
- **JUnit XML**: For integration with test management tools

---

## Report Locations

After running tests, find reports here:

```
reports/
├── html-report/          ← Open index.html in browser
├── results.json          ← JSON format results
├── junit-results.xml     ← JUnit XML format
├── logs/                 ← Detailed test logs
├── screenshots/          ← Failure screenshots
└── videos/               ← Failure recordings
```

---

## Troubleshooting

### Tests Not Running?
1. Check Node.js version: `node --version` (should be 16+)
2. Check Playwright: `npx playwright --version`
3. Clear cache: `rm -rf node_modules && npm install`

### Selectors Outdated?
1. Edit page files in `utils/` folder
2. Update selectors to match current UI
3. Run tests again

### Report Not Generated?
1. Check `reports/` directory exists
2. Check write permissions
3. Run: `npm run test:report`

---

## 📞 Need Help?

1. Check test logs in `reports/logs/`
2. View HTML report: `npm run test:report`
3. Check page object files in `utils/`
4. Review Playwright docs: https://playwright.dev/

---

**Version:** 1.0.0  
**Framework:** Playwright (v1.60.0)  
**Updated:** May 29, 2024
