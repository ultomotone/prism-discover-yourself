# Test Setup Instructions

## Installation Requirements

To run the full test suite, install additional dependencies:

```bash
# Testing framework
npm install -D vitest @vitest/ui

# E2E testing 
npm install -D @playwright/test
npx playwright install

# TypeScript execution
npm install -D tsx
```

## Running Tests

### Library Integrity Tests
```bash
# With vitest installed
npx vitest src/tests/unit/libraryIntegrity.test.ts

# Or manually check fixtures
npm run fixtures:seed-all
npm run fixtures:status
```

### Validator Unit Tests
```bash
# With vitest installed
npx vitest src/tests/unit/validator.test.ts

# Or run QA suite
npm run qa:all
```

### E2E Tests
```bash
# With Playwright installed
npx playwright test src/tests/e2e/

# Headless mode
npx playwright test --headless

# Debug mode
npx playwright test --debug
```

## Test Configuration

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts']
  }
});
```

### playwright.config.ts
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
```

## Manual Testing

If automated tests are not set up, use the QA checklist in `QA.md`:

1. Seed fixtures: `npm run fixtures:seed complete_valid_library`
2. Navigate to `/assessment` 
3. Follow manual checklist steps
4. Clean up: `npm run fixtures:cleanup`

## Current Status

The test files are provided as templates and require:
- [ ] Testing framework installation (vitest, playwright)
- [ ] Test configuration files
- [ ] CI/CD integration setup
- [ ] Component test data attributes

For immediate QA, use the `runQASuite.ts` script which provides automated fixture testing without external dependencies.