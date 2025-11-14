# Integration Tests for EMCS Backend API

## Setup

Before running the tests, install the required dependencies:

```bash
cd backend
npm install
```

The test dependencies are already configured in `package.json`:
- `vitest` - Test framework
- `supertest` - HTTP assertion library
- `@types/supertest` - TypeScript types for supertest
- `@vitest/ui` - Optional UI for test visualization

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with UI
```bash
npx vitest --ui
```

## Test Coverage

The integration tests cover all API endpoints:

### POST /api/consignments
- ✅ Create consignment with valid data
- ✅ Reject missing required fields
- ✅ Reject invalid quantity
- ✅ Reject invalid address format
- ✅ Reject invalid goods type
- ✅ Reject invalid unit

### GET /api/consignments
- ✅ List consignments for operator
- ✅ Filter consignments by status
- ✅ Reject missing operator parameter
- ✅ Reject invalid operator address
- ✅ Reject invalid status filter

### GET /api/consignments/:arc
- ✅ Get consignment details for existing ARC
- ✅ Return 404 for non-existing ARC
- ✅ Reject invalid ARC format

### POST /api/consignments/:arc/dispatch
- ✅ Dispatch consignment with valid authorization
- ✅ Reject unauthorized consignor
- ✅ Reject dispatch for non-Draft consignment
- ✅ Reject missing consignor
- ✅ Reject dispatch for non-existing consignment

### POST /api/consignments/:arc/receive
- ✅ Confirm receipt with valid authorization
- ✅ Reject unauthorized consignee
- ✅ Reject receipt for non-InTransit consignment
- ✅ Reject missing consignee
- ✅ Reject receipt for non-existing consignment

### GET /api/consignments/:arc/events
- ✅ Get movement events for consignment
- ✅ Return empty array for consignment with no events
- ✅ Reject invalid ARC format
- ✅ Sort events chronologically

## Test Architecture

The tests use:
- **Mocked IOTA SDK**: All blockchain interactions are mocked to enable isolated testing
- **Mocked Services**: `arcGenerator`, `iotaService`, and `notarizationService` are mocked
- **Supertest**: For HTTP assertions without starting a real server
- **Vitest**: Modern test framework with built-in TypeScript support

## Notes

- Tests are isolated and don't require a running IOTA node
- All services are mocked to test API logic independently
- Tests validate both success and error scenarios
- Authorization checks are thoroughly tested
- Status transition validation is covered
