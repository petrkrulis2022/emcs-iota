# IOTA Testnet Deployment - Current Blockers

**Date:** November 15, 2025  
**Branch:** `iota-smart-contracts`  
**Status:** ⚠️ BLOCKED - API Incompatibility

## 🚫 Current Blockers

### 1. API Version Mismatch
- **IOTA Testnet API:** v1.11.0-rc (older version)
- **Sui CLI:** v1.60.1 (too new)
- **@mysten/sui SDK:** Latest version expects newer API

**Error:** `Method not found` - The SDK calls methods that don't exist in IOTA's older API version.

### 2. CLI Library Issues
- **IOTA CLI:** Has library dependency issues (GLIBC version mismatch)
- **Error:** `libstdc++.so.6: version GLIBCXX_3.4.29 not found`

### 3. Web Explorer Login Required
- IOTA Explorer requires authentication
- Not suitable for automated deployment

## ✅ What's Ready

1. **All contracts built:** ✓
   - `consignment_enhanced.move`
   - `consignment.move`  
   - `operator_registry.move`

2. **Wallet configured:** ✓
   - Address: `0x5d3b4d49f8260a11a31fe73cda9a43a0f92f3e734d808a3481169aeb3cf6c54a`
   - Balance: 30 IOTA testnet tokens
   - Private key: Available

3. **Deployment scripts:** ✓
   - SDK deployment script created
   - Bech32 key decoding working

## 🔧 Possible Solutions

### Solution 1: Wait for IOTA API Update ⏰
**Best long-term solution**
- IOTA needs to upgrade testnet API to match Sui SDK expectations
- Contact IOTA team via Discord: https://discord.iota.org
- Timeline: Unknown

### Solution 2: Use Older Sui SDK Version 🔄
**Try with compatible SDK**
```bash
cd contracts
npm install @mysten/sui@0.54.0  # Try versions around IOTA's API level
node deploy-with-sdk.js
```

### Solution 3: Manual CLI Deployment with Fixed Libraries 🛠️
**Fix GLIBC dependencies**
```bash
# Reinstall IOTA CLI with compatible libraries
# Or use Docker container with correct dependencies
```

### Solution 4: Request IOTA Team Assistance 🤝
**Recommended immediate action**
- Post in IOTA Discord #developers channel
- Share: "Need to deploy Move contracts to testnet, getting API version mismatch"
- They may have internal deployment tools or updated CLI

### Solution 5: Deploy via IOTA Wallet Extension 💼
**If IOTA has browser wallet with deployment feature**
- Some wallets support package deployment
- Upload compiled bytecode directly

## 📝 Deployment Information Ready

Once deployment succeeds, here's what to extract:

**Package ID:** Found in deployment output `objectChanges` → `type: "published"` → `packageId`

**Registry ID:** Found in `objectChanges` → `type: "created"` → `objectType` contains `operator_registry` → `objectId`

**Update these in backend/.env:**
```env
IOTA_RPC_URL=https://api.testnet.iota.cafe:443
CONTRACT_PACKAGE_ID=<package_id>
OPERATOR_REGISTRY_ID=<registry_id>
CONSIGNMENT_MODULE=emcs::consignment_enhanced
```

## 🎯 Recommended Next Steps

**For Hackathon Demo:**

1. **Keep using `main` branch** for demo with mock blockchain verification
   - ✅ Fully functional UI
   - ✅ Mock IOTA Explorer showing NFT metadata
   - ✅ Data verification working
   - ✅ Professional demo quality

2. **Document the blockchain integration** in presentation:
   - "Smart contracts ready for deployment"
   - "Waiting for IOTA testnet API compatibility"
   - "Mock implementation demonstrates full workflow"

3. **Contact IOTA team** for support:
   - Discord: https://discord.iota.org
   - Ask about: "Deploying Move contracts with current SDK/CLI versions"

**For Production:**

1. Wait for IOTA API update
2. Or try Solution 2 (older SDK version)
3. Deploy contracts
4. Integrate real blockchain calls
5. Merge `iota-smart-contracts` → `main`

## 💡 Silver Lining

Your mock implementation is **production-ready** architecture:
- ✅ Correct NFT metadata structure (matches Move contracts)
- ✅ Proper verification flow (compare on-chain vs off-chain data)
- ✅ Professional UI/UX
- ✅ Easy to swap mock → real blockchain calls

When IOTA deployment works, integration is just:
1. Deploy contracts → Get Package ID
2. Update backend .env
3. Replace mock functions with real SDK calls
4. Done! 🎉

## 📞 Support Contacts

- **IOTA Discord:** https://discord.iota.org
- **IOTA Docs:** https://wiki.iota.org/
- **GitHub Issues:** Report SDK compatibility issues

---

**Current Status:** Ready to deploy, waiting for compatible deployment method. Main branch remains stable for demo.
