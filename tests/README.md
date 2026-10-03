# Parking Slot Manager Automated Tests

This directory is a separate Playwright test project for the complete application.

It tests both the frontend and backend without putting test code inside either application.

## Structure

tests/
- api/health.spec.js
- api/security.spec.js
- e2e/auth.spec.js
- e2e/user-parking.spec.js
- e2e/admin.spec.js
- helpers/test-data.js
- playwright.config.js
- package.json

## First-time setup

PowerShell:

    cd tests
    npm install
    npx playwright install chromium

Start the existing applications first.

Terminal 1:

    cd backend
    npm start

Terminal 2:

    cd frontend
    npm run dev

Then use a third terminal for tests:

    cd tests

## Run everything

    npm test

You will see the test progress directly in the terminal.

## Watch the browser

    npm run test:headed

This opens Chromium and visibly performs the frontend tests.

## Interactive test UI

    npm run test:ui

Playwright UI Mode gives you an interactive test runner where you can select tests, run them, inspect steps, and investigate failures.

## HTML report

After a run:

    npm run test:report

The report is generated under:

    tests/playwright-report/

Failed tests retain traces, screenshots, and videos according to the Playwright configuration.

## Run only backend/API tests

    npm run test:api

## Run only frontend E2E tests

    npm run test:e2e

## Admin credentials

Admin UI and security tests use your existing ADMIN account through environment variables.

PowerShell:

    $env:ADMIN_EMAIL="your-existing-admin-email"
    $env:ADMIN_PASSWORD="your-existing-admin-password"

Optional:

    $env:FRONTEND_URL="http://localhost:3000"
    $env:API_URL="http://localhost:5000/api"

Do not commit real credentials.

## Current automated coverage

USER:
- Registration
- Login
- Invalid login
- Add vehicle
- Select vehicle
- Select parking slot
- Park vehicle
- Verify active session
- Exit vehicle
- Verify parking history

ADMIN:
- Login
- Admin dashboard
- Facilities page
- Areas page
- Slots page
- Parking Sessions page
- Users page
- Vehicles page
- Navigation groups

Backend/API:
- Liveness
- Readiness/database connectivity
- USER denied ADMIN endpoints
- ADMIN allowed ADMIN endpoints

The existing scripts/security-audit.ps1 remains the broader security audit. Do not create another PowerShell audit script just for this framework.
