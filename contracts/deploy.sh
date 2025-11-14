#!/bin/bash

# EMCS Contracts Deployment Script
# This script deploys the Move contracts to IOTA Testnet

set -e

echo "======================================"
echo "EMCS Contracts Deployment Script"
echo "IOTA Testnet Deployment"
echo "======================================"
echo ""

# Check if iota CLI is installed
if ! command -v iota &> /dev/null; then
    echo "❌ Error: IOTA CLI is not installed"
    echo "Please install it with:"
    echo "  curl https://releases.iota.org/install.sh | bash"
    echo ""
    echo "Or download from: https://github.com/iotaledger/iota/releases"
    exit 1
fi

echo "✅ IOTA CLI found"
echo ""

# Check active environment
ACTIVE_ENV=$(iota client active-env 2>&1 || echo "not_configured")

if [[ "$ACTIVE_ENV" == *"not_configured"* ]] || [[ "$ACTIVE_ENV" == *"doesn't exist"* ]]; then
    echo "⚠️  IOTA client not configured"
    echo "Please run the following commands to configure:"
    echo "  iota client new-env --rpc \"https://testnet.iota.org:443\" --alias testnet"
    echo "  iota client switch --env testnet"
    echo "  iota client new-address ed25519"
    exit 1
fi

echo "📍 Active environment: $ACTIVE_ENV"

if [[ "$ACTIVE_ENV" != *"testnet"* ]]; then
    echo "⚠️  Warning: Not on testnet environment"
    echo "Switch to testnet with: iota client switch --env testnet"
    exit 1
fi

echo ""

# Get active address
ACTIVE_ADDRESS=$(iota client active-address)
echo "👛 Active address: $ACTIVE_ADDRESS"
echo ""

# Check gas balance
echo "💰 Checking gas balance..."
iota client gas > /tmp/gas_check.txt 2>&1 || true

if grep -q "No gas coins" /tmp/gas_check.txt; then
    echo "⚠️  No gas objects found"
    echo "Please request testnet tokens with:"
    echo "  iota client faucet"
    echo ""
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
else
    echo "✅ Gas objects found"
fi

echo ""
echo "======================================"
echo "Building contracts..."
echo "======================================"
echo ""

# Build the contracts
iota move build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Build successful"
echo ""
echo "======================================"
echo "Deploying to IOTA Testnet..."
echo "======================================"
echo ""

# Deploy the contracts
echo "Publishing package (this may take 10-30 seconds)..."
iota client publish --gas-budget 100000000 --json > deploy_output.json

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""

# Parse the deployment output
PACKAGE_ID=$(cat deploy_output.json | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
REGISTRY_ID=$(cat deploy_output.json | jq -r '.objectChanges[] | select(.objectType | contains("operator_registry::OperatorRegistry")) | .objectId')

echo "======================================"
echo "Deployment Information"
echo "======================================"
echo ""
echo "📦 Package ID: $PACKAGE_ID"
echo "🗂️  Operator Registry ID: $REGISTRY_ID"
echo ""
echo "🔗 View on IOTA Explorer:"
echo "   https://explorer.iota.cafe/object/$PACKAGE_ID?network=testnet"
echo ""

# Save to .env file
ENV_FILE="../backend/.env"

if [ -f "$ENV_FILE" ]; then
    echo "📝 Updating $ENV_FILE..."
    
    # Update or add the configuration
    if grep -q "CONTRACT_PACKAGE_ID=" "$ENV_FILE"; then
        sed -i "s|CONTRACT_PACKAGE_ID=.*|CONTRACT_PACKAGE_ID=$PACKAGE_ID|" "$ENV_FILE"
    else
        echo "CONTRACT_PACKAGE_ID=$PACKAGE_ID" >> "$ENV_FILE"
    fi
    
    if grep -q "OPERATOR_REGISTRY_ID=" "$ENV_FILE"; then
        sed -i "s|OPERATOR_REGISTRY_ID=.*|OPERATOR_REGISTRY_ID=$REGISTRY_ID|" "$ENV_FILE"
    else
        echo "OPERATOR_REGISTRY_ID=$REGISTRY_ID" >> "$ENV_FILE"
    fi
    
    if grep -q "IOTA_RPC_URL=" "$ENV_FILE"; then
        sed -i "s|IOTA_RPC_URL=.*|IOTA_RPC_URL=https://testnet.iota.org:443|" "$ENV_FILE"
    else
        echo "IOTA_RPC_URL=https://testnet.iota.org:443" >> "$ENV_FILE"
    fi
    
    echo "✅ Backend .env file updated"
else
    echo "⚠️  Backend .env file not found at $ENV_FILE"
    echo "Please create it manually with:"
    echo ""
    echo "CONTRACT_PACKAGE_ID=$PACKAGE_ID"
    echo "OPERATOR_REGISTRY_ID=$REGISTRY_ID"
    echo "IOTA_RPC_URL=https://testnet.iota.org:443"
    echo "PORT=3001"
fi

echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo ""
echo "1. ✅ Contracts deployed to IOTA Testnet"
echo "2. ✅ Backend .env updated (if file exists)"
echo "3. ⏭️  Test the backend API: cd ../backend && npm run dev"
echo "4. ⏭️  Deploy backend and frontend"
echo ""
echo "To test the contract directly:"
echo "iota client call --package $PACKAGE_ID --module consignment --function create_consignment --args \"24EU12345678901234567\" \"$ACTIVE_ADDRESS\" \"Wine\" 1000 \"Liters\" \"Bordeaux\" \"Berlin\" 1731499200000 --gas-budget 10000000"
echo ""
echo "Deployment output saved to: deploy_output.json"
echo ""

