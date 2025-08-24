# PRISM Assessment QA Suite

## Overview
Comprehensive quality assurance suite to prevent test submissions from slipping through production. Includes automated tests, fixtures, and manual checklists.

## Quick Start

### Run All Tests
```bash
# Run complete QA suite
npm run qa:all

# Run individual suites
npm run qa:library    # Library integrity tests
npm run qa:validator  # Validation unit tests  
npm run qa:e2e       # UI/E2E tests
```

### Fixture Management
```bash
# Seed all test fixtures
npm run fixtures:seed-all

# Seed specific fixture
npm run fixtures:seed complete_valid_library

# Clean up fixtures
npm run fixtures:cleanup

# Check fixture status
npm run fixtures:status
```

## Test Fixtures

### Available Fixtures

| Fixture | Description | Expected Validation |
|---------|-------------|-------------------|
| `complete_valid_library` | Happy path with all components | ✅ Pass |
| `fc_deficit_23_blocks` | Only 23 FC blocks (< min 24) | ❌ Fail: FC insufficient |
| `inc_missing_pair` | Missing INC_*_B items | ❌ Fail: Incomplete pairs |
| `ac_trap_obvious_wrong` | AC with obvious wrong answers | ❌ Fail: AC incorrect |
| `no_sd_items` | Missing social desirability | ❌ Fail: No SD present |
| `neuro_gap_missing_items` | Missing N/N_R items | ❌ Fail: System integrity |
| `email_only_required` | Only Q1 required, Q2-Q16 optional | ✅ Pass (with warnings) |

### Sample Usage
```typescript
import { HAPPY_PATH_FIXTURE, SAMPLE_RESPONSES } from '@/fixtures/assessmentFixtures';

// Test with fixture
const result = await validatePrismAssessment(
  SAMPLE_RESPONSES.happy_path, 
  HAPPY_PATH_FIXTURE.questions
);
```

## Automated Tests

### Library Integrity (`src/tests/unit/libraryIntegrity.test.ts`)
- ✅ Required fields present (id, text, type, section, required)
- ✅ Only allowed question types
- ✅ FC cardinality matches type (forced-choice-2 = 2 options)
- ✅ INC pairs complete (A+B items)
- ✅ SD items present
- ✅ Neuroticism items with proper reverse_scored flags
- ✅ Only Q1 (email) marked required, Q2-Q16 optional

### Validator Unit Tests (`src/tests/unit/validator.test.ts`)
- ✅ FC threshold: 23 answered + 24 min = fail
- ✅ INC pairs: Missing A or B = fail  
- ✅ AC correctness: Wrong answer = fail
- ✅ SD presence: Missing SD = fail
- ✅ Happy path: All conditions met = pass
- ✅ Error handling: API failures graceful
- ✅ Edge cases: Empty responses, duplicates

### E2E UI Tests (`src/tests/e2e/assessmentFlow.spec.ts`)
- ✅ Keyboard-only navigation of FC options
- ✅ Error focus management (first error focused)
- ✅ Email-only required logic (Q2-Q16 optional)
- ✅ FC blocks render as radio groups
- ✅ Validation error display with progress
- ✅ Accessibility (ARIA labels, screen reader announcements)

## Manual QA Checklist

### Pre-Release Gate
Before any deployment, manually verify:

#### ✅ Happy Path Validation
1. [ ] Load assessment with complete library
2. [ ] Fill FC ≥ 24 questions  
3. [ ] Complete all INC pairs (A+B responses)
4. [ ] Answer AC questions correctly
5. [ ] Ensure SD item present
6. [ ] Submit successfully → should pass validation

#### ❌ Negative Test Cases
1. [ ] Submit with FC = 23 → should be blocked with "23/24" error
2. [ ] Answer AC question incorrectly → should be blocked with "attention check" error
3. [ ] Remove SD from library → should show "system integrity" error
4. [ ] Leave INC pair incomplete → should be blocked with "inconsistency pair" error

#### 📧 Required Field Logic
1. [ ] Q1 (email) marked required, shows validation error if empty
2. [ ] Q2-Q16 marked optional, can skip without validation errors
3. [ ] Can submit with only email IF integrity rules satisfied (FC≥24, etc.)
4. [ ] Integrity errors take precedence over optional field warnings

#### 🎯 UI/UX Verification  
1. [ ] FC questions render as radio group blocks (not individual questions)
2. [ ] Error summary appears at top on validation failure
3. [ ] First error receives focus for accessibility
4. [ ] Progress breakdown shown in error summary (20/24 FC, etc.)
5. [ ] Can dismiss error summary, retry submission
6. [ ] Keyboard navigation works for all FC options

### Accessibility Checklist
1. [ ] All FC blocks have proper `role="radiogroup"`
2. [ ] Error alerts have `aria-live="assertive"`
3. [ ] Required fields have `aria-required="true"`
4. [ ] Error messages associated with fields via `aria-describedby`
5. [ ] Focus management works with keyboard-only navigation

## Results Reporting

### QA Summary Format
```json
{
  "passed": 24,
  "failed": 2,
  "bySuite": {
    "library": "8/8",
    "validator": "12/12", 
    "e2e": "4/6"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "gitSHA": "abc123def",
  "details": [
    {
      "suite": "e2e",
      "test": "keyboard_navigation",
      "status": "fail",
      "error": "FC option not focusable",
      "duration": 1200
    }
  ]
}
```

### Failure Post-Mortem Prompts
When tests fail, use these prompts for quick iteration:

**Library Failure:**
> "The library integrity test failed with error: `{error}`. This usually indicates missing required components or incorrect question configuration. Check the fixture definition and ensure all required tags/sections are present."

**Validator Failure:**
> "The validation test failed with error: `{error}`. This indicates the validation logic is not catching the expected error condition. Review the validation function and test the specific edge case manually."

**E2E Failure:**  
> "The UI test failed with error: `{error}`. This suggests the frontend validation gate or UI behavior is not working as expected. Check component rendering and validation error handling."

## Integration with CI/CD

### Pre-commit Hook
```bash
#!/bin/bash
# Run QA suite before commit
npm run qa:all
if [ $? -ne 0 ]; then
  echo "❌ QA suite failed - commit blocked"
  exit 1
fi
```

### Deployment Gate
```bash
# In deployment pipeline
npm run qa:all
if [ $? -eq 0 ]; then
  echo "✅ QA passed - proceeding with deployment"
else
  echo "❌ QA failed - deployment blocked"
  exit 1
fi
```

## Configuration

### Environment Variables
```bash
# Test environment
NODE_ENV=test
SUPABASE_URL=your-test-instance-url
SUPABASE_ANON_KEY=your-test-anon-key

# QA settings
QA_TIMEOUT=30000
QA_HEADLESS=true
QA_PARALLEL=false
```

### Package.json Scripts
```json
{
  "scripts": {
    "qa:all": "node src/scripts/runQASuite.ts",
    "qa:library": "vitest src/tests/unit/libraryIntegrity.test.ts",
    "qa:validator": "vitest src/tests/unit/validator.test.ts", 
    "qa:e2e": "playwright test src/tests/e2e/",
    "fixtures:seed-all": "node src/scripts/seedFixtures.ts seed-all",
    "fixtures:seed": "node src/scripts/seedFixtures.ts seed",
    "fixtures:cleanup": "node src/scripts/seedFixtures.ts cleanup",
    "fixtures:status": "node src/scripts/seedFixtures.ts status"
  }
}
```

## Troubleshooting

### Common Issues

**Fixture Seeding Fails**
- Check Supabase connection and permissions
- Verify assessment_questions table schema matches fixtures
- Run `npm run fixtures:cleanup` and retry

**Validation Tests Fail**
- Ensure edge functions (getConfig, getView) are deployed
- Check mock responses match expected format
- Verify test fixtures have required components

**E2E Tests Timeout**
- Increase QA_TIMEOUT environment variable
- Check if assessment loads properly in test environment
- Verify test selectors match current component structure

### Debug Mode
```bash
# Run with verbose logging
DEBUG=true npm run qa:all

# Run single test
npm run qa:validator -- --reporter=verbose
```

## Maintenance

### Adding New Test Cases
1. Create fixture in `assessmentFixtures.ts`
2. Add corresponding test in appropriate test file
3. Update manual checklist if needed
4. Run `npm run qa:all` to verify

### Updating Validation Rules
1. Update validation logic in `prismValidation.ts`
2. Add test case covering new rule
3. Update fixtures if needed
4. Update QA checklist

### Performance Monitoring
- Track QA suite runtime (should be < 2 minutes)
- Monitor test flakiness (< 1% failure rate)
- Review fixture seeding time (should be < 30 seconds)