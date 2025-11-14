@echo off
REM EMCS Backend API Test Script for Windows
REM Tests all API endpoints to verify backend configuration

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:3000
set WALLET_ADDRESS=%1
if "%WALLET_ADDRESS%"=="" set WALLET_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

echo ======================================
echo EMCS Backend API Test Script
echo ======================================
echo.
echo Base URL: %BASE_URL%
echo Test Wallet: %WALLET_ADDRESS%
echo.

REM Check if server is running
echo Checking if server is running...
curl -s "%BASE_URL%/health" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Server is not running!
    echo Please start the server with: npm run dev
    exit /b 1
)
echo Server is running
echo.

echo ======================================
echo Running API Tests
echo ======================================
echo.

REM Test 1: Health check
echo Test 1: Health Check
curl -s "%BASE_URL%/health"
echo.
echo.

REM Test 2: API info
echo Test 2: API Info
curl -s "%BASE_URL%/api"
echo.
echo.

REM Test 3: List consignments
echo Test 3: List Consignments
curl -s "%BASE_URL%/api/consignments?operator=%WALLET_ADDRESS%"
echo.
echo.

REM Test 4: Create consignment
echo Test 4: Create Consignment
curl -s -X POST "%BASE_URL%/api/consignments" ^
  -H "Content-Type: application/json" ^
  -d "{\"consignor\":\"%WALLET_ADDRESS%\",\"consignee\":\"0xabcdef1234567890abcdef1234567890abcdef12\",\"goodsType\":\"Wine\",\"quantity\":1000,\"unit\":\"Liters\",\"origin\":\"Bordeaux, France\",\"destination\":\"Berlin, Germany\"}"
echo.
echo.

REM Test 5: Get consignment by ARC
echo Test 5: Get Consignment by ARC
curl -s "%BASE_URL%/api/consignments/24EU12345678901234567"
echo.
echo.

REM Test 6: Get consignment events
echo Test 6: Get Consignment Events
curl -s "%BASE_URL%/api/consignments/24EU12345678901234567/events"
echo.
echo.

echo ======================================
echo Tests Complete
echo ======================================
echo.
echo Note: Some endpoints may return errors if contracts are not yet deployed.
echo After deploying contracts, all endpoints should work correctly.
echo.

pause
