# ✅ Test Execution Checklist & Verification Guide

## Pre-Execution Checklist

### Environment Setup
- [ ] Node.js installed (v16 or higher)
  ```bash
  node --version
  ```
  Expected: v16+

- [ ] npm installed
  ```bash
  npm --version
  ```
  Expected: v8+

- [ ] Project directory created
  ```bash
  ls -la /Users/preeti/ui-api-autoamiton-shopping-app
  ```

- [ ] Dependencies installed
  ```bash
  npm install
  ```

- [ ] Playwright installed
  ```bash
  npx playwright --version
  ```
  Expected: v1.60.0 or higher

### Network & Application
- [ ] Internet connection available
- [ ] Website accessible: https://rahulshettyacademy.com/client/#/auth/login
- [ ] Test account credentials valid:
  - Email: `practice@automation.com`
  - Password: `Test@123`

---

## Test Execution Commands

### 1. Run All Tests (Full Suite)
```bash
npm test
```
**Expected Output:**
- All 18 tests execute
- Reports generated in `reports/` directory
- Console shows pass/fail status

### 2. Run Positive Tests Only
```bash
npm run test:positive
```
**Expected Count:** 12 tests pass

### 3. Run Negative Tests Only
```bash
npm run test:negative
```
**Expected Count:** 6 tests pass (validating negative scenarios)

### 4. Run in Interactive UI Mode
```bash
npm run test:ui
```
**Expected:** Browser opens with test runner UI

### 5. Run in Headed Mode (See Browser)
```bash
npm run test:headed
```
**Expected:** Tests run with visible browser window

### 6. Debug Mode
```bash
npm run test:debug
```
**Expected:** Playwright inspector opens for debugging

---

## Test Results Verification

### ✅ Successful Test Execution Indicators

After running `npm test`, verify:

1. **Console Output**
   - [ ] Tests listed with status (✓ PASSED or ✗ FAILED)
   - [ ] Total test count shown (18 tests)
   - [ ] Execution duration displayed
   - [ ] Pass/fail summary at end

2. **Reports Generated**
   ```bash
   ls -la reports/
   ```
   - [ ] `html-report/` directory exists
   - [ ] `results.json` file created
   - [ ] `junit-results.xml` file created
   - [ ] `logs/` directory with test logs

3. **HTML Report**
   ```bash
   npm run test:report
   ```
   - [ ] Browser opens automatically
   - [ ] Shows test summary with charts
   - [ ] Displays pass count: 18
   - [ ] Shows execution duration

4. **Log Files**
   ```bash
   ls -la reports/logs/
   ```
   - [ ] Test log file created with timestamp
   - [ ] Contains test execution details

---

## Individual Test Case Verification

### Positive Test Cases (12 tests)

#### Login Tests (3 tests)
- [ ] **TC_P001** - Valid login execution
- [ ] **TC_P002** - Login page elements visibility
- [ ] **TC_P003** - Login page URL verification

#### Search Tests (2 tests)
- [ ] **TC_P004** - IPHONE product search found
- [ ] **TC_P005** - Search results populated

#### Cart Tests (4 tests)
- [ ] **TC_P006** - Product added to cart
- [ ] **TC_P007** - Product verified in cart
- [ ] **TC_P008** - Cart page displays items
- [ ] **TC_P009** - Checkout button visible

#### Checkout Tests (2 tests)
- [ ] **TC_P010** - Navigate to checkout
- [ ] **TC_P011** - Checkout page elements present

#### End-to-End Tests (1 test)
- [ ] **TC_P012** - Complete order placement flow

### Negative Test Cases (6 tests)

#### Login Failures (3 tests)
- [ ] **TC_N001** - Invalid credentials rejected
- [ ] **TC_N002** - Wrong password rejected
- [ ] **TC_N003** - Non-existent email rejected

#### Search & Cart (3 tests)
- [ ] **TC_N004** - Non-existent product not found
- [ ] **TC_N005** - Empty cart checkout prevention
- [ ] **TC_N006** - Session invalidation on logout

---

## Performance Metrics

After test execution, note:

**Timing Information**
- [ ] Average test duration: _____ seconds
- [ ] Longest test: _____ seconds
- [ ] Shortest test: _____ seconds

**Success Rates**
- [ ] Total tests: 18
- [ ] Tests passed: _____
- [ ] Tests failed: _____
- [ ] Pass percentage: _____%

---

## Troubleshooting Verification

### Issue: Tests Won't Run
```bash
# Check 1: Verify node modules
ls -la node_modules/ | wc -l
# Should show 100+ files

# Check 2: Verify Playwright
npx playwright --version
# Should show version number

# Check 3: Verify test files
ls -la tests/UItests/positive/ tests/UItests/negative/
# Should show all .spec.ts files
```

### Issue: No Reports Generated
```bash
# Check 1: Reports directory
ls -la reports/
# Should exist and have subdirectories

# Check 2: Directory permissions
touch reports/test-file.txt
# Should succeed

# Check 3: Disk space
df -h
# Verify adequate space
```

### Issue: Selectors Not Found
```bash
# Check 1: Application accessibility
curl -s https://rahulshettyacademy.com/client/ | head -20
# Should return HTML

# Check 2: Browser compatibility
npx playwright install
# Ensure browsers installed
```

### Issue: Credentials Invalid
- [ ] Verify credentials in `config/testData.ts`
- [ ] Test manual login at: https://rahulshettyacademy.com/client/#/auth/login
- [ ] Update credentials if changed

---

## Post-Execution Checklist

### Report Review
- [ ] Open HTML report: `npm run test:report`
- [ ] Review test summary
- [ ] Check for failures
- [ ] Review failure screenshots (if any)
- [ ] Check test timings

### Log Review
```bash
cat reports/logs/test-*.log | tail -50
```
- [ ] No ERROR level entries (expected)
- [ ] All INFO entries present
- [ ] TEST status entries showing PASSED

### Artifact Review
- [ ] Screenshots in `reports/screenshots/` (if failures)
- [ ] Videos in `reports/videos/` (if failures)
- [ ] JSON report parseable: `cat reports/results.json | head -20`

### CI/CD Integration (if applicable)
- [ ] JUnit XML valid
- [ ] Can be read by CI/CD tools
- [ ] Test results exportable

---

## Expected Test Execution Flow

```
┌─────────────────────────────────────┐
│ Test Execution Start                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Load Playwright Config              │
│ - Base URL: Shopping App            │
│ - Browsers: Chromium               │
│ - Reporters: HTML, JSON, JUnit      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Setup Test Environment              │
│ - Initialize logger                │
│ - Load test data                   │
│ - Create reports directory          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Execute Positive Tests (12)         │
│ - Login tests (3)                  │
│ - Search tests (2)                 │
│ - Cart tests (4)                   │
│ - Checkout tests (2)               │
│ - E2E test (1)                     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Execute Negative Tests (6)          │
│ - Invalid login (3)                │
│ - Search/Cart errors (3)           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Capture Artifacts                   │
│ - Screenshots (on failure)          │
│ - Videos (on failure)              │
│ - Test logs                        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Generate Reports                    │
│ - HTML Report                      │
│ - JSON Report                      │
│ - JUnit XML Report                 │
│ - Console Summary                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Test Execution Complete             │
│ Status: PASSED / FAILED            │
└─────────────────────────────────────┘
```

---

## Success Criteria

✅ **Project is successful when:**

- [ ] All 18 tests execute without errors
- [ ] Pass rate: 100% (18/18 passed)
- [ ] Logs created in `reports/logs/`
- [ ] HTML report generated and viewable
- [ ] All page objects working correctly
- [ ] No network errors or timeouts
- [ ] Console output shows clear results

---

## Quick Verification Commands

```bash
# Navigate to project
cd /Users/preeti/ui-api-autoamiton-shopping-app

# Run all tests and capture results
npm test 2>&1 | tee test-execution.log

# Count test files
find tests -name "*.spec.ts" | wc -l
# Expected: 8 files

# Count total test cases (approximate)
grep -r "test(" tests | wc -l
# Expected: 18+ cases

# Verify reports
ls -la reports/html-report/index.html
# Should exist

# View test summary
cat test-execution.log | grep -E "passed|failed"
```

---

## Documentation References

- 📖 **Complete Guide:** [README.md](README.md)
- 🚀 **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- 📊 **Setup Summary:** [PROJECT_SETUP_COMPLETE.md](PROJECT_SETUP_COMPLETE.md)
- 🔧 **Config:** [playwright.config.ts](playwright.config.ts)
- 📝 **Test Data:** [config/testData.ts](config/testData.ts)

---

## Support & Issues

**If tests fail:**
1. Check error logs in `reports/logs/`
2. Review HTML report for details
3. Check selectors in `utils/` files
4. Verify credentials in `config/testData.ts`
5. Ensure website is accessible

**If reports don't generate:**
1. Verify `reports/` directory exists
2. Check file system permissions
3. Run: `mkdir -p reports/{html-report,logs,screenshots,videos}`
4. Try running tests again

---

**Last Updated:** May 29, 2024  
**Version:** 1.0.0  
**Status:** Ready for Testing ✅
