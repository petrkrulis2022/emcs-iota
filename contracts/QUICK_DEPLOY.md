# Quick Deploy Guide - IOTA Testnet

## Prerequisites
- IOTA CLI installed
- Testnet configured
- Wallet funded

## Quick Commands

### 1. Setup (First Time Only)
```bash
# Install IOTA CLI
curl https://releases.iota.org/install.sh | bash

# Configure testnet
iota client new-env --rpc "https://api.testnet.iota.cafe:443" --alias testnet
iota client switch --env testnet

# Create wallet
iota client new-address ed25519

# Get tokens
iota client faucet
```

### 2. Deploy
```bash
# Navigate to contracts
cd contracts

# Build
iota move build

# Deploy
iota client publish --gas-budget 100000000 --json > deploy_output.json
```

### 3. Extract Info
Look in `deploy_output.json` for:
- **Package ID**: `objectChanges` → `type: "published"` → `packageId`
- **Registry ID**: `objectChanges` → `type: "created"` → `objectType` contains `operator_registry` → `objectId`

### 4. Update Backend
Edit `backend/.env`:
```env
IOTA_RPC_URL=https://api.testnet.iota.cafe:443
CONTRACT_PACKAGE_ID=<your_package_id>
OPERATOR_REGISTRY_ID=<your_registry_id>
```

### 5. Verify
```bash
# View on explorer
echo "https://explorer.iota.cafe/object/<PACKAGE_ID>?network=testnet"

# Test call
iota client call \
  --package <PACKAGE_ID> \
  --module consignment \
  --function create_consignment \
  --args "24EU12345678901234567" "$(iota client active-address)" "Wine" 1000 "Liters" "Origin" "Dest" 1731499200000 \
  --gas-budget 10000000
```

## Common Issues

| Issue | Solution |
|-------|----------|
| `iota: command not found` | Install IOTA CLI |
| `Insufficient gas` | Run `iota client faucet` |
| `Wrong network` | Run `iota client switch --env testnet` |
| Build warnings | Ignore - non-critical |

## Resources
- Explorer: https://explorer.iota.cafe/?network=testnet
- Docs: https://wiki.iota.org/
- Discord: https://discord.iota.org
