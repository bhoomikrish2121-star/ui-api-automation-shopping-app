# Playwright Shopping App Automation - Project Setup

## Project Overview
This is a comprehensive Playwright automation project for testing the shopping application at https://rahulshettyacademy.com/client/

## Project Structure
- **tests/UItests/** - Test cases (positive and negative)
- **utils/** - Helper functions and utilities
- **config/** - Configuration files
- **reports/** - Test reports and artifacts

## Key Features
- 6 Positive test cases with key validations
- 3 Negative test cases for error handling
- Comprehensive logging setup
- HTML, JSON, and JUnit test reports
- Page Object Model pattern implementation
- Screenshot and video capture on failures

## Execution Guidelines
- Install dependencies: `npm install`
- Run all tests: `npm test`
- Run with UI: `npm run test:ui`
- Run positive tests: `npm run test:positive`
- Run negative tests: `npm run test:negative`
- View report: `npm run test:report`

## Test Scenarios Covered
1. Login functionality (valid/invalid credentials)
2. Product search for 'IPHONE'
3. Add product to cart
4. Update cart quantities
5. Checkout process
6. Order placement and verification
