# Deploy Now - Step-by-Step Guide

Follow these steps to deploy your EMCS contracts to IOTA Testnet.

## Prerequisites Check

Run these commands to check your setup:

```bash
# Check if IOTA CLI is installed
iota --version

# Check if you're configured
iota client active-env

# Check your address
iota client active-address

# Check your balance
iota client gas
```

## If Not Set Up Yet

### 1. Install IOTA CLI

**Method A: Automated Script (Recommended for WSL/Linux/Mac):**
```bash
cd contracts
chmod +x install-iota-rust.sh
./install-iota-rust.sh
```

**Method B: Manual Installation with Rust:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Clone and build IOTA CLI
git clone https://github.com/iotaledger/iota.git ~/iota-cli
cd ~/iota-cli
cargo install --path crates/iota-cli --locked

# Verify
iota --version
```

**Method C: If you have Node.js:**
```bash
npm install -g @iota/cli
iota --version
```

**Need help?** See `INSTALL_IOTA_CLI.md` for more options.

**Windows:**
Download from: https://releases.iota.org/

### 2. Configure for Testnet

```bash
# Add testnet environment
iota client new-env --rpc "https://testnet.iota.org:443" --alias testnet

# Switch to testnet
iota client switch --env testnet

# Create wallet (SAVE YOUR RECOVERY PHRASE!)
iota client new-address ed25519
```

### 3. Get Testnet Tokens

```bash
iota client faucet
```

Wait 10 seconds, then verify:
```bash
iota client gas
```

## Deploy Contracts

### Option A: Automated Script (Recommended)

**Linux/Mac/WSL:**
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

### Option B: Manual Commands

```bash
# Navigate to contracts directory
cd contracts

# Build contracts
iota move build

# Deploy to testnet
iota client publish --gas-budget 100000000 --json > deploy_output.json

# View the output
cat deploy_output.json
```

## Extract Deployment Info

Open `deploy_output.json` and find:

1. **Package ID**:
   - Look for: `"type": "published"`
   - Copy the `"packageId"` value

2. **Operator Registry ID**:
   - Look for: `"objectType"` containing `"operator_registry::OperatorRegistry"`
   - Copy the `"objectId"` value

## Update Backend Configuration

Edit `backend/.env` (create if doesn't exist):

```env
PORT=3000
IOTA_RPC_URL=https://api.testnet.iota.cafe:443
CONTRACT_PACKAGE_ID=<paste_package_id_here>
OPERATOR_REGISTRY_ID=<paste_registry_id_here>
FRONTEND_URL=http://localhost:5173
```

## Verify Deployment

### View on Explorer

```
https://explorer.iota.cafe/object/<YOUR_PACKAGE_ID>?network=testnet
```

### Test Contract Call

```bash
iota client call \
  --package <YOUR_PACKAGE_ID> \
  --module consignment \
  --function create_consignment \
  --args "24EU12345678901234567" "$(iota client active-address)" "Wine" 1000 "Liters" "Bordeaux" "Berlin" 1731499200000 \
  --gas-budget 10000000
```

If successful, you'll see a transaction digest!

## Troubleshooting

### "iota: command not found"
Install IOTA CLI (see step 1 above)

### "Insufficient gas"
Run: `iota client faucet`

### "Wrong network"
Run: `iota client switch --env testnet`

### "Build failed"
Make sure you're in the `contracts` directory

## Next Steps

After successful deployment:

1. ✅ Contracts deployed
2. ✅ Backend .env configured
3. ⏭️ Test backend: `cd backend && npm run dev`
4. ⏭️ Test frontend: `cd frontend && npm run dev`
5. ⏭️ Deploy to production

## Need Help?

- Check `DEPLOYMENT_INSTRUCTIONS.md` for detailed guide
- Check `QUICK_DEPLOY.md` for quick reference
- Join IOTA Discord: https://discord.iota.org
