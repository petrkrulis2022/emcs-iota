# Testing Instructions

This document provides comprehensive testing instructions for the EMCS Blockchain Demo project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Smart Contract Testing](#smart-contract-testing)
4. [Backend API Testing](#backend-api-testing)
5. [Frontend Testing](#frontend-testing)
6. [Integration Testing](#integration-testing)
7. [Manual Testing](#manual-testing)
8. [Test Data](#test-data)

## Prerequisites

Before running tests, ensure you have:

- Node.js 20+ installed
- npm or yarn package manager
- IOTA CLI installed (for contract testing)
- All dependencies installed (`npm install` in root, backend, and frontend)
- Environment variables configured (`.env` files)

## Environment Setup

### 1. Install Dependencies

```bash
# Root directory
npm install

# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# Contracts (if testing Move contracts)
cd contracts
# IOTA CLI should be installed
```

### 2. Configure Test Environment

#### Backend Test Environment

Create `backend/.env.test`:

```env
PORT=3001
IOTA_RPC_URL=https://testnet.iota.org:443
CONTRACT_PACKAGE_ID=test_package_id
OPERATOR_REGISTRY_ID=test_registry_id
FRONTEND_URL=http://localhost:5173
NODE_ENV=test
```

#### Frontend Test Environment

Create `frontend/.env.test`:

```env
VITE_API_URL=http://localhost:3001
VITE_IOTA_NETWORK=testnet
```

## Smart Contract Testing

### Run Move Tests

```bash
cd contracts

# Build contracts
iota move build

# Run Move unit tests (if any)
iota move test

# Test contract deployment (dry run)
iota client publish --gas-budget 100000000 --skip-dependency-verification
```

### Manual Contract Testing

After deploying to testnet:

```bash
# Get your address
iota client active-address

# Test create_consignment
iota client call \
  --package YOUR_PACKAGE_ID \
  --module consignment \
  --function create_consignment \
  --args "24EU12345678901234567" "0xYOUR_CONSIGNEE_ADDRESS" "Wine" 1000 "Liters" "Bordeaux" "Berlin" 1731499200000 \
  --gas-budget 10000000

# Test dispatch_consignment
iota client call \
  --package YOUR_PACKAGE_ID \
  --module consignment \
  --function dispatch_consignment \
  --args CONSIGNMENT_OBJECT_ID "0xDOCUMENT_HASH" 1731499300000 \
  --gas-budget 10000000

# Test receive_consignment
iota client call \
  --package YOUR_PACKAGE_ID \
  --module consignment \
  --function receive_consignment \
  --args CONSIGNMENT_OBJECT_ID 1731499400000 \
  --gas-budget 10000000
```

## Backend API Testing

### Run Automated Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### API Endpoint Testing

#### Using the Test Script

**Linux/Mac:**
```bash
cd backend
chmod +x test-api.sh
./test-api.sh
```

**Windows:**
```bash
cd backend
test-api.bat
```

#### Manual API Testing with curl

```bash
# Health check
curl http://localhost:3000/health

# Get API info
curl http://localhost:3000/api

# Create consignment
curl -X POST http://localhost:3000/api/consignments \
  -H "Content-Type: application/json" \
  -d '{
    "consignor": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "consignee": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "goodsType": "Wine",
    "quantity": 1000,
    "unit": "Liters",
    "origin": "Bordeaux, France",
    "destination": "Berlin, Germany"
  }'

# Get consignments
curl "http://localhost:3000/api/consignments?operator=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

# Get specific consignment
curl http://localhost:3000/api/consignments/24EU12345678901234567

# Dispatch consignment
curl -X POST http://localhost:3000/api/consignments/24EU12345678901234567/dispatch \
  -H "Content-Type: application/json" \
  -d '{"consignor": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"}'

# Receive consignment
curl -X POST http://localhost:3000/api/consignments/24EU12345678901234567/receive \
  -H "Content-Type: application/json" \
  -d '{"consignee": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"}'

# Get movement events
curl http://localhost:3000/api/consignments/24EU12345678901234567/events
```

#### Using Postman

1. Import the API collection (if provided)
2. Set environment variables:
   - `BASE_URL`: http://localhost:3000
   - `CONSIGNOR_ADDRESS`: Your wallet address
   - `CONSIGNEE_ADDRESS`: Test consignee address
3. Run the collection tests

## Frontend Testing

### Run Automated Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm test -- --coverage
```

### Component Testing

Tests are located in `frontend/src/**/*.test.tsx`

Key test files:
- `components/ConsignmentForm.test.tsx`
- `components/WalletConnect.test.tsx`
- `components/QRCodeDisplay.test.tsx`
- `pages/Dashboard.test.tsx`
- `pages/ConsignmentDetail.test.tsx`

### Build Testing

```bash
cd frontend

# Test production build
npm run build

# Preview production build
npm run preview

# Or use the test script
chmod +x test-build.sh
./test-build.sh  # Linux/Mac
test-build.bat   # Windows
```

## Integration Testing

### Full Stack Testing

1. **Start all services:**

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

2. **Test complete workflow:**

#### Test Scenario 1: Create Consignment

1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Approve wallet connection
4. Navigate to "Create Consignment"
5. Fill form:
   - Consignee: Valid IOTA address
   - Goods Type: Wine
   - Quantity: 1000
   - Unit: Liters
   - Origin: Bordeaux, France
   - Destination: Berlin, Germany
6. Click "Create Consignment"
7. Verify success message
8. Check dashboard for new consignment

#### Test Scenario 2: Dispatch Consignment

1. Go to Dashboard
2. Find consignment in "Draft" status
3. Click "Dispatch"
4. Confirm transaction in wallet
5. Verify status changes to "In Transit"
6. Check movement history

#### Test Scenario 3: Receive Consignment

1. Connect with consignee wallet
2. Go to Dashboard
3. Find consignment in "In Transit" status
4. Click "Confirm Receipt"
5. Confirm transaction in wallet
6. Verify status changes to "Received"
7. Check complete movement history

### API Integration Testing

```bash
cd backend

# Run integration tests
npm run test:integration

# Or manually test with curl
./test-api.sh
```

## Manual Testing

### Checklist

#### Smart Contracts
- [ ] Contracts build successfully
- [ ] Contracts deploy to testnet
- [ ] Create consignment function works
- [ ] Dispatch consignment function works
- [ ] Receive consignment function works
- [ ] Events are emitted correctly
- [ ] Authorization checks work

#### Backend API
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] All API endpoints respond correctly
- [ ] Error handling works
- [ ] CORS is configured correctly
- [ ] Environment variables are loaded

#### Frontend
- [ ] App loads without errors
- [ ] Wallet connection works
- [ ] Navigation works
- [ ] Forms validate input
- [ ] API calls succeed
- [ ] Error messages display
- [ ] Loading states work
- [ ] Responsive design works

#### End-to-End
- [ ] Complete consignment workflow
- [ ] Multiple users can interact
- [ ] Blockchain transactions confirm
- [ ] Data persists correctly
- [ ] QR codes generate and scan
- [ ] Movement history displays

## Test Data

### Test Wallet Addresses

```
Consignor: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
Consignee: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

### Test Consignment Data

```json
{
  "consignor": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "consignee": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "goodsType": "Wine",
  "quantity": 1000,
  "unit": "Liters",
  "origin": "Bordeaux, France",
  "destination": "Berlin, Germany"
}
```

### Test ARCs

```
24EU12345678901234567
24EU98765432109876543
24EU11111111111111111
```

## Troubleshooting Tests

### Backend Tests Fail

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env.test

# Run tests with verbose output
npm test -- --verbose
```

### Frontend Tests Fail

```bash
# Clear cache
rm -rf node_modules/.vite
npm install

# Run tests with debugging
npm test -- --reporter=verbose
```

### Integration Tests Fail

1. Verify all services are running
2. Check network connectivity
3. Verify contract addresses in `.env`
4. Check wallet has testnet tokens
5. Review browser console for errors

## Continuous Integration

### GitHub Actions (if configured)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: cd backend && npm test
      - run: cd frontend && npm test
```

## Test Coverage

### Generate Coverage Reports

```bash
# Backend coverage
cd backend
npm test -- --coverage

# Frontend coverage
cd frontend
npm test -- --coverage
```

### View Coverage Reports

- Backend: `backend/coverage/index.html`
- Frontend: `frontend/coverage/index.html`

## Performance Testing

### Load Testing (Optional)

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 http://localhost:3000/health

# Test with POST
ab -n 100 -c 5 -p test-data.json -T application/json http://localhost:3000/api/consignments
```

## Security Testing

### Basic Security Checks

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check dependencies
npm outdated
```

## Reporting Issues

When reporting test failures, include:

1. Test command used
2. Full error message
3. Environment details (OS, Node version)
4. Steps to reproduce
5. Expected vs actual behavior

---

**For additional help, see:**
- [README.md](README.md) - Project overview
- [Backend Configuration](backend/CONFIGURATION.md)
- [Deployment Guides](contracts/DEPLOYMENT_INSTRUCTIONS.md)
