# EMCS Blockchain Demo - IOTA Testnet Deployment Instructions

## Important: IOTA vs Sui

This project is built for the **IOTA Moveathon** using IOTA's Move-based blockchain. While the Move language is similar to Sui's implementation, you must use **IOTA CLI tools**, not Sui CLI.

## Prerequisites

Before deploying the Move contracts to IOTA Testnet, ensure you have:

1. **IOTA CLI installed**
   - Verify installation: `iota --version`

2. **IOTA Client configured for testnet**
   - Testnet RPC endpoint configured
   - Wallet keypair generated

3. **Testnet tokens in your wallet**
   - Request from IOTA testnet faucet

## Step-by-Step Deployment Guide

### Step 1: Install IOTA CLI

**Quick Install (Linux/WSL/Mac):**
```bash
# Download pre-built binary
mkdir -p ~/.iota/bin
curl -L https://github.com/iotaledger/iota/releases/latest/download/iota-x86_64-unknown-linux-gnu -o ~/.iota/bin/iota
chmod +x ~/.iota/bin/iota

# Add to PATH
export PATH="$HOME/.iota/bin:$PATH"
echo 'export PATH="$HOME/.iota/bin:$PATH"' >> ~/.bashrc

# Verify installation
iota --version
```

**Alternative Methods:**

If the above doesn't work, see `INSTALL_IOTA_CLI.md` for:
- Using the install script
- Different architectures (Mac M1/M2, ARM, etc.)
- Windows installation
- Troubleshooting steps

**Windows:**
Download the installer from: https://github.com/iotaledger/iota/releases

### Step 2: Configure IOTA Client for Testnet

Set up the testnet environment:
```bash
# Add testnet environment
iota client new-env --rpc "https://api.testnet.iota.cafe:443" --alias testnet

# Switch to testnet
iota client switch --env testnet

# Verify active environment
iota client active-env
# Should output: testnet
```

### Step 3: Create or Import Wallet

**Generate a new wallet:**
```bash
iota client new-address ed25519
```

**IMPORTANT**: Save your recovery phrase securely! You'll need it to recover your wallet.

**Get your wallet address:**
```bash
iota client active-address
```

Copy this address - you'll need it for the faucet.

### Step 4: Get Testnet Tokens

**Option 1: Using IOTA CLI (Easiest)**
```bash
iota client faucet
```

**Option 2: Using curl**
```bash
# Get your address first
ADDRESS=$(iota client active-address)

# Request tokens from faucet
curl --location --request POST 'https://faucet.testnet.iota.cafe/v1/gas' \
--header 'Content-Type: application/json' \
--data-raw "{\"FixedAmountRequest\": {\"recipient\": \"$ADDRESS\"}}"
```

**Option 3: Using Discord**
1. Join IOTA Discord: https://discord.iota.org
2. Go to #testnet-faucet channel
3. Request testnet tokens

**Verify you received tokens:**
```bash
iota client gas
```

You should see gas objects listed with amounts.

### Step 5: Build the Move Contracts

Navigate to the contracts directory:
```bash
cd contracts
```

Build the contracts:
```bash
iota move build
```

**Expected output:**
```
BUILDING emcs_contracts
```

If you see warnings about duplicate aliases or unused constants, you can ignore them - they don't affect functionality.

### Step 6: Deploy to IOTA Testnet

Deploy the contracts and save the output to a JSON file:
```bash
iota client publish --gas-budget 100000000 --json > deploy_output.json
```

**What this does:**
- Publishes both modules (consignment and operator_registry) as a package
- Calls the `init` function in operator_registry to create the registry object
- Saves deployment details to `deploy_output.json`

**Expected output:**
You should see a transaction digest and status. The command will take 5-10 seconds.

**Alternative (without JSON output):**
```bash
iota client publish --gas-budget 100000000
```

### Step 7: Extract Deployment Information

You need to extract two key values from the deployment output:

1. **Package ID** - The published package identifier
2. **Operator Registry ID** - The created OperatorRegistry object

**Manual extraction from deploy_output.json:**

Look for:
```json
{
  "objectChanges": [
    {
      "type": "published",
      "packageId": "0xABCD1234...",  // <- This is your Package ID
      ...
    },
    {
      "type": "created",
      "objectType": "...::operator_registry::OperatorRegistry",
      "objectId": "0xEF567890...",  // <- This is your Operator Registry ID
      ...
    }
  ]
}
```

**Using helper script (if Node.js available):**
```bash
node extract-deployment-info.js deploy_output.json --write
```

### Step 8: Update Backend Configuration

Create or update `backend/.env` file with the deployment information:

```env
# Server Configuration
PORT=3000

# IOTA Configuration
IOTA_RPC_URL=https://api.testnet.iota.cafe:443
CONTRACT_PACKAGE_ID=YOUR_PACKAGE_ID_HERE
OPERATOR_REGISTRY_ID=YOUR_OPERATOR_REGISTRY_ID_HERE

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

Replace `YOUR_PACKAGE_ID_HERE` and `YOUR_OPERATOR_REGISTRY_ID_HERE` with the values from Step 7.

### Step 9: Verify Deployment

**View on IOTA Explorer:**
```bash
echo "View on explorer: https://explorer.iota.cafe/object/YOUR_PACKAGE_ID?network=testnet"
```

**Test a contract call:**
```bash
# Get your address
MY_ADDRESS=$(iota client active-address)

# Test creating a consignment
iota client call \
  --package YOUR_PACKAGE_ID \
  --module consignment \
  --function create_consignment \
  --args "24EU12345678901234567" "$MY_ADDRESS" "Wine" 1000 "Liters" "Bordeaux" "Berlin" 1731499200000 \
  --gas-budget 10000000
```

If successful, you should see a transaction digest and the consignment object created.

## Automated Deployment Scripts

For convenience, we've provided automated deployment scripts:

**Linux/Mac:**
```bash
cd contracts
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```bash
cd contracts
deploy-windows.bat
```

**Note:** These scripts may need to be updated to use `iota` commands instead of `sui` commands.

## Troubleshooting

### "iota: command not found"
**Solution:** IOTA CLI is not installed or not in PATH. Follow Step 1 to install.

### "IOTA client not configured"
**Solution:** Run the configuration commands from Step 2 to set up testnet environment.

### "Insufficient gas"
**Solution:** Request more tokens from the faucet:
```bash
iota client faucet
```

### "Package verification failed"
**Solution:** 
- Verify you're on testnet: `iota client active-env`
- Rebuild contracts: `iota move build`
- Try deploying again

### "Wrong network"
**Solution:** Ensure you're on testnet:
```bash
iota client switch --env testnet
iota client active-env
```

### "Cannot find deploy_output.json"
**Solution:** Make sure you're in the `contracts` directory and that the publish command completed successfully.

### Build warnings about "duplicate aliases" or "unused constants"
**Solution:** These are non-critical linting warnings and can be safely ignored.

## Post-Deployment Checklist

- [ ] Package ID obtained and saved
- [ ] OperatorRegistry Object ID obtained and saved
- [ ] Backend `.env` file updated with deployment values
- [ ] Deployment verified on IOTA Explorer
- [ ] Test contract call successful
- [ ] Backend can connect to deployed contracts

## Next Steps

After successful deployment:

1. **Test Backend Integration** (Task 10.2)
   - Start backend server
   - Test API endpoints with Postman
   - Verify blockchain interactions work

2. **Deploy Backend** (Task 10.3)
   - Deploy to Railway/Render/Heroku
   - Configure environment variables

3. **Deploy Frontend** (Task 10.4)
   - Build and deploy to Vercel/Netlify
   - Test complete user flow

## Resources

- **IOTA Testnet Explorer**: https://explorer.iota.cafe/?network=testnet
- **IOTA Documentation**: https://wiki.iota.org/
- **IOTA Move Documentation**: https://wiki.iota.org/iota-sandbox/welcome/
- **IOTA Discord**: https://discord.iota.org
- **IOTA GitHub**: https://github.com/iotaledger/iota

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the deployment output for error messages
3. Verify all prerequisites are met
4. Check IOTA Discord #testnet-faucet or #dev-help channels
