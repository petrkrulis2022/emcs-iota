# IOTA Smart Contracts Deployment Status

**Branch:** `iota-smart-contracts`  
**Date:** November 15, 2025  
**Status:** Ready for Deployment (Awaiting Compatible CLI)

## ✅ What's Ready

### 1. Contracts Built Successfully
All three Move contracts are compiled and ready:
- ✅ `consignment_enhanced.move` - **Main NFT contract** (RECOMMENDED)
- ✅ `consignment.move` - Basic version with beer fields
- ✅ `operator_registry.move` - SEED operator authorization

### 2. Build Artifacts
```
build/emcs_contracts/
├── BuildInfo.yaml
├── bytecode_modules/
│   ├── consignment.mv
│   ├── consignment_enhanced.mv
│   └── operator_registry.mv
├── debug_info/
└── sources/
```

**Package Digest:** `1011A16D3E8AED2F4FEFCABA52CEC6BF03990D31DE79F831C6324095A0E6B844`

### 3. IOTA Testnet Configuration
- ✅ Network: https://api.testnet.iota.cafe:443
- ✅ Wallet Address: `0x7080d6f152f38c5377001df35fe0e5c9d5a16f7579fcf322d843a5f40813a730`
- ✅ Environment: `iota-testnet` (active)

## ⚠️ Current Blocker

**API Version Mismatch:**
- Sui CLI version: 1.60.1
- IOTA server version: 1.11.0-rc
- Error: `Method not found` when calling publish

## 🚀 Deployment Options

### Option 1: Wait for Compatible CLI (Recommended)
IOTA team needs to update testnet API or provide compatible CLI version.

### Option 2: Use IOTA SDK with Private Key
```bash
# Install dependencies (already done)
cd contracts
npm install

# Set your wallet private key
export IOTA_PRIVATE_KEY="your-base64-private-key"

# Run SDK deployment
node deploy-with-sdk-complete.js
```

### Option 3: Manual Deployment via IOTA Explorer
1. Visit: https://explorer.iota.cafe/
2. Connect wallet
3. Use "Publish Package" feature
4. Upload `build/emcs_contracts` folder

### Option 4: Deploy to Sui Testnet (Alternative)
```bash
# Switch to Sui testnet
sui client new-env --rpc "https://fullnode.testnet.sui.io:443" --alias sui-testnet
sui client switch --env sui-testnet

# Get testnet tokens
sui client faucet

# Deploy
sui client publish --gas-budget 100000000
```

## 📋 Post-Deployment Checklist

After successful deployment, update:

### 1. Backend Environment Variables
Edit `backend/.env`:
```env
IOTA_RPC_URL=https://api.testnet.iota.cafe:443
CONTRACT_PACKAGE_ID=<package_id_from_deployment>
OPERATOR_REGISTRY_ID=<registry_object_id>
CONSIGNMENT_MODULE=emcs::consignment_enhanced
```

### 2. Extract Deployment Info
From deployment output JSON, get:
- **Package ID**: `objectChanges` → `type: "published"` → `packageId`
- **Registry ID**: `objectChanges` → `type: "created"` → `objectType` contains `operator_registry` → `objectId`

### 3. Verify Deployment
```bash
# View on explorer
https://explorer.iota.cafe/object/<PACKAGE_ID>?network=testnet

# Test contract call
sui client call \
  --package <PACKAGE_ID> \
  --module consignment_enhanced \
  --function create_consignment \
  --args \
    "24IE12345678901234567" \
    "0x..." \
    "Beer" \
    1000 \
    "Liters" \
    "Dublin" \
    "Cork" \
    '{"type": "0x6::clock::Clock"}' \
  --gas-budget 10000000
```

## 🎯 Recommended Contract: `consignment_enhanced.move`

**Why enhanced version?**
- ✅ Immutable `NotarizationRecord` for legal proof
- ✅ Frozen objects for audit trail
- ✅ Cancel function for draft consignments
- ✅ Comprehensive event system (5 event types)
- ✅ Better error handling (6 error codes)
- ✅ Backward compatible `MovementEvent`

**Contract Features:**
- Administrative Reference Code (ARC) tracking
- Document hash notarization (SHA256)
- Status lifecycle: Draft → In Transit → Received → Cancelled
- Timestamp tracking (created, dispatched, received)
- Authorization checks (consignor/consignee permissions)
- Immutable proof objects for customs verification

## 📊 Contract Alignment with Frontend

### ✅ Fully Supported
- ARC, consignor, consignee, goods_type, quantity, unit
- Origin, destination, status, timestamps
- Document hash (e-AD notarization)
- Events for all state transitions

### 📦 Stored Off-Chain (Backend Database)
- Beer packaging details (canSize, cansPerPackage, numberOfPackages)
- Transport details (vehicleLicensePlate, containerNumber)
- SEED operator detailed info (companyName, vatNumber, address)

**Note:** This architecture is correct - store business data off-chain, store compliance/verification data on-chain.

## 🔄 Next Steps

1. **Resolve CLI version mismatch** - Contact IOTA support or wait for update
2. **Alternative: Use SDK deployment** - Requires private key export
3. **Test deployment** on Sui testnet as proof of concept
4. **Update backend** with deployed package IDs
5. **Integrate real blockchain calls** - Replace mock NFT data with actual on-chain queries
6. **Test verification flow** - Customs officers verify against real blockchain data

## 📝 Notes

- Main branch (`main`) remains stable with working mock implementation
- This branch (`iota-smart-contracts`) is for blockchain integration
- Can demo product from main branch without smart contracts
- Merge this branch after successful deployment and testing

## 🆘 Support Resources

- IOTA Discord: https://discord.iota.org
- IOTA Docs: https://wiki.iota.org/
- Sui Move Docs: https://docs.sui.io/
- Explorer: https://explorer.iota.cafe/

---

**Last Updated:** November 15, 2025  
**Status:** Contracts ready, awaiting compatible deployment method
