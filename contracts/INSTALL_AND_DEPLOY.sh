#!/bin/bash

# EMCS IOTA CLI Installation and Deployment Script
# This script installs IOTA CLI and deploys contracts to testnet

set -e

echo "======================================"
echo "EMCS IOTA Setup and Deployment"
echo "======================================"
echo ""

# Step 1: Install IOTA CLI
echo "Step 1: Installing IOTA CLI..."
echo ""

if command -v iota &> /dev/null; then
    echo "✅ IOTA CLI already installed"
    iota --version
else
    echo "Installing IOTA CLI..."
    
    # Create directory
    mkdir -p ~/.iota/bin
    
    # Download binary
    echo "Downloading IOTA CLI binary..."
    curl -L https://github.com/iotaledger/iota/releases/latest/download/iota-x86_64-unknown-linux-gnu -o ~/.iota/bin/iota
    
    # Make executable
    chmod +x ~/.iota/bin/iota
    
    # Add to PATH for this session
    export PATH="$HOME/.iota/bin:$PATH"
    
    # Add to .bashrc for future sessions
    if ! grep -q '.iota/bin' ~/.bashrc; then
        echo 'export PATH="$HOME/.iota/bin:$PATH"' >> ~/.bashrc
        echo "✅ Added IOTA to PATH in ~/.bashrc"
    fi
    
    # Verify installation
    if command -v iota &> /dev/null; then
        echo "✅ IOTA CLI installed successfully"
        iota --version
    else
        echo "❌ Installation failed. Please check INSTALL_IOTA_CLI.md for alternative methods."
        exit 1
    fi
fi

echo ""
echo "======================================"
echo "Step 2: Configure IOTA Client"
echo "======================================"
echo ""

# Check if already configured
ACTIVE_ENV=$(iota client active-env 2>&1 || echo "not_configured")

if [[ "$ACTIVE_ENV" == *"testnet"* ]]; then
    echo "✅ Already configured for testnet"
else
    echo "Configuring IOTA client for testnet..."
    
    # Add testnet environment
    iota client new-env --rpc "https://testnet.iota.org:443" --alias testnet
    
    # Switch to testnet
    iota client switch --env testnet
    
    echo "✅ Testnet environment configured"
    echo ""
    echo "⚠️  IMPORTANT: You need to create a wallet address"
    echo "Run: iota client new-address ed25519"
    echo "SAVE YOUR RECOVERY PHRASE SECURELY!"
    echo ""
    read -p "Press Enter after you've created your wallet address..."
fi

echo ""
echo "======================================"
echo "Step 3: Get Testnet Tokens"
echo "======================================"
echo ""

# Get address
ADDRESS=$(iota client active-address 2>&1 || echo "no_address")

if [[ "$ADDRESS" == *"no_address"* ]] || [[ "$ADDRESS" == *"Error"* ]]; then
    echo "⚠️  No wallet address found"
    echo "Please create one with: iota client new-address ed25519"
    exit 1
fi

echo "Your address: $ADDRESS"
echo ""
echo "Requesting testnet tokens from faucet..."

iota client faucet

echo ""
echo "Waiting 5 seconds for tokens to arrive..."
sleep 5

echo ""
echo "Checking balance..."
iota client gas

echo ""
read -p "Do you see gas objects above? Press Enter to continue or Ctrl+C to exit..."

echo ""
echo "======================================"
echo "Step 4: Deploy Contracts"
echo "======================================"
echo ""

# Build contracts
echo "Building contracts..."
iota move build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Build successful"
echo ""
echo "Deploying to IOTA Testnet..."
echo "This may take 10-30 seconds..."
echo ""

# Deploy
iota client publish --gas-budget 100000000 --json > deploy_output.json

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""

# Parse output
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

# Update backend .env
ENV_FILE="../backend/.env"

if [ -f "$ENV_FILE" ]; then
    echo "📝 Updating $ENV_FILE..."
    
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
    echo "Creating $ENV_FILE..."
    cat > "$ENV_FILE" << EOF
PORT=3000
IOTA_RPC_URL=https://testnet.iota.org:443
CONTRACT_PACKAGE_ID=$PACKAGE_ID
OPERATOR_REGISTRY_ID=$REGISTRY_ID
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ Backend .env file created"
fi

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Test backend: cd ../backend && npm run dev"
echo "2. Test frontend: cd ../frontend && npm run dev"
echo "3. Deploy to production"
echo ""
echo "Deployment output saved to: deploy_output.json"
echo ""

