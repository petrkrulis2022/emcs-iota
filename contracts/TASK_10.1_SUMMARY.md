# Task 10.1 Summary: Deploy Move Contracts to IOTA Testnet

## Status: ⚠️ Requires Manual User Action

### What Has Been Completed ✅

1. **Contracts Built** - Move contracts successfully compiled
2. **Deployment Scripts Updated for IOTA**:
   - `deploy.sh` - Automated deployment for Linux/Mac (updated for IOTA)
   - `deploy-windows.bat` - Automated deployment for Windows (updated for IOTA)
   - `extract-deployment-info.js` - Node.js helper to parse deployment output
   - `extract-deployment-info.ps1` - PowerShell helper for Windows

3. **Documentation Created**:
   - `DEPLOYMENT_INSTRUCTIONS.md` - Complete step-by-step guide for IOTA
   - `QUICK_DEPLOY.md` - Quick reference card for IOTA
   - `DEPLOYMENT_STATUS.md` - Updated with current status
   - `TASK_10.1_SUMMARY.md` - This summary

4. **Prerequisites Verified**:
   - ✅ Contracts built successfully
   - ✅ Deployment scripts ready for IOTA
   - ⏳ IOTA CLI needs to be installed

### Important: IOTA vs Sui

This project is for the **IOTA Moveathon**, not Sui. While both use Move language:

**Use IOTA:**
- ✅ `iota` CLI commands
- ✅ IOTA testnet: `https://api.testnet.iota.cafe:443`
- ✅ IOTA explorer: `https://explorer.iota.cafe/?network=testnet`
- ✅ IOTA faucet: `iota client faucet`

**Don't use Sui:**
- ❌ `sui` CLI commands
- ❌ Sui testnet endpoints
- ❌ Sui explorer

### What Requires User Action 🚨

The deployment process requires **interactive user input** that cannot be automated:

#### 1. Install IOTA CLI

**macOS/Linux:**
```bash
curl https://releases.iota.org/install.sh | bash
```

**Windows:**
Download from: https://github.com/iotaledger/iota/releases

**Verify:**
```bash
iota --version
```

#### 2. Configure IOTA Client (One-time setup)

```bash
# Add testnet environment
iota client new-env --rpc "https://api.testnet.iota.cafe:443" --alias testnet

# Switch to testnet
iota client switch --env testnet

# Generate wallet
iota client new-address ed25519
```

**IMPORTANT**: Save your recovery phrase securely!

#### 3. Get Testnet Tokens

```bash
# Request tokens from faucet
iota client faucet

# Verify balance
iota client gas
```

#### 4. Deploy Contracts

```bash
cd contracts
iota move build
iota client publish --gas-budget 100000000 --json > deploy_output.json
```

#### 5. Extract Deployment Info

Look in `deploy_output.json` for:
- **Package ID**: `objectChanges` → `type: "published"` → `packageId`
- **Registry ID**: `objectChanges` → `type: "created"` → `objectType` contains `operator_registry` → `objectId`

### Quick Start Guide

**For First-Time Users:**
1. Read `DEPLOYMENT_INSTRUCTIONS.md` for detailed steps
2. Install IOTA CLI
3. Configure IOTA client and get testnet tokens
4. Run deployment
5. Extract deployment information

**For Configured Users:**
1. See `QUICK_DEPLOY.md` for fast deployment
2. Run: `iota client publish --gas-budget 100000000 --json > deploy_output.json`
3. Extract Package ID and Registry ID from output

### Expected Deployment Output

After successful deployment, you will have:
- **Package ID**: Unique identifier for the deployed contract package
- **Operator Registry ID**: Object ID for the operator registry

These values need to be added to `backend/.env`:
```env
CONTRACT_PACKAGE_ID=0x...
OPERATOR_REGISTRY_ID=0x...
IOTA_RPC_URL=https://api.testnet.iota.cafe:443
```

### Verification Steps

After deployment, verify:

1. **View package on explorer:**
   ```
   https://explorer.iota.cafe/object/PACKAGE_ID?network=testnet
   ```

2. **Test contract call:**
   ```bash
   iota client call --package PACKAGE_ID --module consignment \
     --function create_consignment \
     --args "24EU12345678901234567" "YOUR_ADDRESS" "Wine" 1000 "Liters" "Origin" "Dest" 1731499200000 \
     --gas-budget 10000000
   ```

### Next Steps

Once deployment is complete:
- ✅ Task 10.1 complete
- ⏭️ Proceed to Task 10.2: Configure backend with deployed contract addresses
- ⏭️ Test backend API endpoints
- ⏭️ Deploy backend and frontend

### Troubleshooting

**"iota: command not found"**
- IOTA CLI is not installed. Follow Step 1 to install.

**"IOTA client not configured"**
- Run the configuration commands from Step 2

**"Insufficient gas"**
- Request more tokens: `iota client faucet`

**"Wrong network"**
- Ensure you're on testnet: `iota client switch --env testnet`

**"Package verification failed"**
- Verify environment: `iota client active-env` (should show "testnet")
- Rebuild: `iota move build`
- Try again

### Resources

- **IOTA Testnet Explorer**: https://explorer.iota.cafe/?network=testnet
- **IOTA Documentation**: https://wiki.iota.org/
- **IOTA Move Docs**: https://wiki.iota.org/iota-sandbox/welcome/
- **IOTA Discord**: https://discord.iota.org
- **IOTA GitHub**: https://github.com/iotaledger/iota

### Common Mistakes to Avoid

1. ❌ Using `sui` commands instead of `iota` commands
2. ❌ Using Sui testnet endpoints
3. ❌ Trying to use Sui explorer for IOTA contracts
4. ✅ Always use `iota` CLI for this project
5. ✅ Use IOTA testnet endpoints and explorer
