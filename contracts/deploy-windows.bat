@echo off
REM EMCS Contracts Deployment Script for Windows
REM This script deploys the Move contracts to IOTA Testnet

echo ======================================
echo EMCS Contracts Deployment Script
echo IOTA Testnet Deployment
echo ======================================
echo.

REM Check if iota CLI is installed
where iota >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: IOTA CLI is not installed
    echo Please install it from: https://github.com/iotaledger/iota/releases
    echo Or run: curl https://releases.iota.org/install.sh ^| bash
    exit /b 1
)

echo IOTA CLI found
echo.

REM Check active environment
iota client active-env >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo IOTA client not configured
    echo Please run the following commands to configure:
    echo   iota client new-env --rpc "https://api.testnet.iota.cafe:443" --alias testnet
    echo   iota client switch --env testnet
    echo   iota client new-address ed25519
    exit /b 1
)

echo Active environment:
iota client active-env
echo.

REM Get active address
echo Active address:
iota client active-address
echo.

REM Check gas balance
echo Checking gas balance...
iota client gas
echo.
echo If no gas found, request tokens with: iota client faucet
echo.

echo ======================================
echo Building contracts...
echo ======================================
echo.

REM Build the contracts
iota move build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed
    exit /b 1
)

echo.
echo Build successful
echo.
echo ======================================
echo Deploying to IOTA Testnet...
echo ======================================
echo.

REM Deploy the contracts
echo Publishing package (this may take 10-30 seconds)...
iota client publish --gas-budget 100000000 --json > deploy_output.json

if %ERRORLEVEL% NEQ 0 (
    echo Deployment failed
    exit /b 1
)

echo.
echo Deployment successful!
echo.

REM Note: Parsing JSON in batch is complex, so we'll display the file
echo ======================================
echo Deployment Information
echo ======================================
echo.
echo The deployment output has been saved to deploy_output.json
echo.
echo Please extract the following values:
echo   1. Package ID - Look for "type": "published" and copy the "packageId"
echo   2. Operator Registry ID - Look for "operator_registry::OperatorRegistry" and copy the "objectId"
echo.
echo Then update backend/.env with:
echo   CONTRACT_PACKAGE_ID=^<package_id^>
echo   OPERATOR_REGISTRY_ID=^<registry_id^>
echo   IOTA_RPC_URL=https://api.testnet.iota.cafe:443
echo.

type deploy_output.json

echo.
echo ======================================
echo View on IOTA Explorer
echo ======================================
echo.
echo After extracting the Package ID, view it at:
echo https://explorer.iota.cafe/object/^<PACKAGE_ID^>?network=testnet
echo.

echo ======================================
echo Next Steps
echo ======================================
echo.
echo 1. Extract Package ID and Operator Registry ID from deploy_output.json above
echo 2. Update backend/.env with the deployment info
echo 3. Test the backend API: cd ..\backend ^&^& npm run dev
echo 4. Deploy backend and frontend
echo.

pause

