# Test Setup and Execution Guide

## Overview

Integration tests have been implemented for all API endpoints in the EMCS Backend. The tests use Vitest and Supertest with mocked IOTA SDK services for isolated testing.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

This will install:
- `vitest@^1.0.4` - Modern test framework
- `supertest@^6.3.3` - HTTP assertion library
- `@types/supertest@^6.0.2` - TypeScript types
- `@vitest/ui@^1.0.4` - Optional test UI

## Running Tests

### Option 1: Run all tests once (recommended for CI/CD)
```bash
npm test
```

### Option 2: Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Option 3: Run tests with UI
```bash
npx vitest --ui
```

## Test Files

- **Location**: `backend/src/__tests__/consignmentRoutes.test.ts`
- **Configuration**: `backend/vitest.config.ts`
- **Test Count**: 30+ test cases covering all endpoints

## What's Tested

### ✅ POST /api/consignments (6 tests)
- Create consignment with valid data
- Validation: missing fields, invalid quantity, invalid addresses
- Validation: invalid goods type and unit

### ✅ GET /api/consignments (5 tests)
- List consignments for operator
- Filter by status
- Validation: missing/invalid operator, invalid status

### ✅ GET /api/consignments/:arc (3 tests)
- Get consignment details
- Handle non-existing ARC (404)
- Validate ARC format

### ✅ POST /api/consignments/:arc/dispatch (5 tests)
- Dispatch with valid authorization
- Authorization checks (only consignor can dispatch)
- Status validation (only Draft can be dispatched)
- Handle missing consignor and non-existing consignment

### ✅ POST /api/consignments/:arc/receive (5 tests)
- Confirm receipt with valid authorization
- Authorization checks (only consignee can receive)
- Status validation (only In Transit can be received)
- Handle missing consignee and non-existing consignment

### ✅ GET /api/consignments/:arc/events (4 tests)
- Get movement events
- Handle empty events
- Validate ARC format
- Verify chronological sorting

## Mocking Strategy

All IOTA SDK interactions are mocked to enable:
- **Fast execution**: No blockchain calls
- **Isolation**: Tests don't depend on external services
- **Reliability**: Tests are deterministic

Mocked services:
- `arcGenerator.generateARC()`
- `arcGenerator.validateARC()`
- `iotaService.executeTransaction()`
- `iotaService.getConsignmentByARC()`
- `iotaService.getConsignmentsByOperator()`
- `iotaService.queryEvents()`
- `notarizationService.createEADDocument()`
- `notarizationService.notarizeDocument()`

## Expected Output

When tests pass, you should see:

```
✓ backend/src/__tests__/consignmentRoutes.test.ts (30)
  ✓ Consignment API Integration Tests (30)
    ✓ POST /api/consignments (6)
    ✓ GET /api/consignments (5)
    ✓ GET /api/consignments/:arc (3)
    ✓ POST /api/consignments/:arc/dispatch (5)
    ✓ POST /api/consignments/:arc/receive (5)
    ✓ GET /api/consignments/:arc/events (4)

Test Files  1 passed (1)
Tests  30 passed (30)
```

## Troubleshooting

### Issue: "Cannot find module 'vitest'"
**Solution**: Run `npm install` in the backend directory

### Issue: "Module not found" errors
**Solution**: Ensure you're using Node.js 18+ and have run `npm install`

### Issue: Tests fail with import errors
**Solution**: Check that `"type": "module"` is set in package.json

### Issue: TypeScript errors
**Solution**: Run `npm run build` to check for TypeScript compilation errors

## Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: cd backend && npm install

- name: Run tests
  run: cd backend && npm test

- name: Check coverage
  run: cd backend && npx vitest --coverage
```

## Next Steps

After tests pass:
1. Run `npm run build` to compile TypeScript
2. Run `npm start` to start the server
3. Test endpoints manually with Postman or curl
4. Deploy to your chosen platform (Railway, Render, Heroku)

## Notes

- Tests use in-memory Express app (no server startup required)
- All blockchain interactions are mocked
- Tests validate both success and error scenarios
- Authorization and status transition logic is thoroughly tested
- Tests are fast (typically < 1 second total execution time)
