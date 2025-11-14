#!/bin/bash

# EMCS Backend API Test Script
# Tests all API endpoints to verify backend configuration

set -e

BASE_URL="http://localhost:3000"
WALLET_ADDRESS="${1:-0x1234567890abcdef1234567890abcdef12345678}"

echo "======================================"
echo "EMCS Backend API Test Script"
echo "======================================"
echo ""
echo "Base URL: $BASE_URL"
echo "Test Wallet: $WALLET_ADDRESS"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo "Testing: $name"
    echo "  $method $endpoint"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "  ${GREEN}✓ PASS${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running!${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

echo "======================================"
echo "Running API Tests"
echo "======================================"
echo ""

# Test 1: Health check
test_endpoint "Health Check" "GET" "/health"

# Test 2: API info
test_endpoint "API Info" "GET" "/api"

# Test 3: List consignments
test_endpoint "List Consignments" "GET" "/api/consignments?operator=$WALLET_ADDRESS"

# Test 4: Create consignment
CREATE_DATA='{
  "consignor": "'$WALLET_ADDRESS'",
  "consignee": "0xabcdef1234567890abcdef1234567890abcdef12",
  "goodsType": "Wine",
  "quantity": 1000,
  "unit": "Liters",
  "origin": "Bordeaux, France",
  "destination": "Berlin, Germany"
}'
test_endpoint "Create Consignment" "POST" "/api/consignments" "$CREATE_DATA"

# Test 5: Get consignment by ARC (will likely return 404 if not deployed)
test_endpoint "Get Consignment by ARC" "GET" "/api/consignments/24EU12345678901234567"

# Test 6: Get consignment events (will likely return 404 if not deployed)
test_endpoint "Get Consignment Events" "GET" "/api/consignments/24EU12345678901234567/events"

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed${NC}"
    echo ""
    echo "Note: Some failures are expected if contracts are not yet deployed."
    echo "After deploying contracts, all tests should pass."
    exit 1
fi
