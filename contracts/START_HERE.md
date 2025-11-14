# 🚀 Start Here - IOTA Testnet Deployment

## Quick Start (Choose Your Path)

### Path 1: Automated Installation & Deployment (Easiest)

```bash
cd ~/EMCS\ -\ IOTA/contracts
chmod +x install-iota-rust.sh
./install-iota-rust.sh
```

Then configure and deploy:
```bash
# Configure testnet
iota client new-env --rpc "https://testnet.iota.org:443" --alias testnet
iota client switch --env testnet
iota client new-address ed25519  # SAVE YOUR RECOVERY PHRASE!

# Get tokens
iota client faucet

# Deploy
./deploy.sh
```

### Path 2: Manual Step-by-Step

#### Step 1: Install IOTA CLI

**Option A: Build from Source (Most Reliable)**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Clone and build IOTA
git clone https://github.com/iotaledger/iota.git ~/iota-cli
cd ~/iota-cli
cargo install --path crates/iota-cli --locked

# Verify
iota --version
```

**Option B: Using NPM (If you have Node.js)**
```bash
npm install -g @iota/cli
iota --version
```

#### Step 2: Configure Testnet
```bash
iota client new-env --rpc "https://testnet.iota.org:443" --alias testnet
iota client switch --env testnet
iota client new-address ed25519
```

**⚠️ IMPORTANT: Save your recovery phrase!**

#### Step 3: Get Testnet Tokens
```bash
iota client faucet
iota client gas  # Verify you received tokens
```

#### Step 4: Deploy Contracts
```bash
cd ~/EMCS\ -\ IOTA/contracts
iota move build
iota client publish --gas-budget 100000000 --json > deploy_output.json
```

#### Step 5: Extract Deployment Info

Open `deploy_output.json` and find:
- **Package ID**: Look for `"type": "published"` → `"packageId"`
- **Registry ID**: Look for `"operator_registry::OperatorRegistry"` → `"objectId"`

#### Step 6: Update Backend Config

Edit `backend/.env`:
```env
PORT=3000
IOTA_RPC_URL=https://testnet.iota.org:443
CONTRACT_PACKAGE_ID=<your_package_id>
OPERATOR_REGISTRY_ID=<your_registry_id>
FRONTEND_URL=http://localhost:5173
```

## Troubleshooting

### "iota: command not found"
- Make sure Rust is installed: `cargo --version`
- Check PATH: `echo $PATH | grep cargo`
- Add to PATH: `export PATH="$HOME/.cargo/bin:$PATH"`
- Reload shell: `source ~/.bashrc`

### "Insufficient gas"
```bash
iota client faucet
```

### "Wrong network"
```bash
iota client switch --env testnet
iota client active-env  # Should show "testnet"
```

### Build fails
```bash
# Make sure you're in contracts directory
cd ~/EMCS\ -\ IOTA/contracts

# Clean and rebuild
rm -rf build/
iota move build
```

## Documentation Reference

- **INSTALL_IOTA_CLI.md** - Detailed installation guide with all methods
- **DEPLOYMENT_INSTRUCTIONS.md** - Complete deployment guide
- **DEPLOY_NOW.md** - Quick deployment walkthrough
- **QUICK_DEPLOY.md** - Command reference
- **install-iota-rust.sh** - Automated installation script

## Verification

After deployment, verify:

```bash
# View on explorer
echo "https://explorer.iota.cafe/object/<PACKAGE_ID>?network=testnet"

# Test contract call
iota client call \
  --package <PACKAGE_ID> \
  --module consignment \
  --function create_consignment \
  --args "24EU12345678901234567" "$(iota client active-address)" "Wine" 1000 "Liters" "Origin" "Dest" 1731499200000 \
  --gas-budget 10000000
```

## Next Steps After Deployment

1. ✅ Contracts deployed to IOTA Testnet
2. ⏭️ Test backend: `cd backend && npm run dev`
3. ⏭️ Test frontend: `cd frontend && npm run dev`
4. ⏭️ Deploy backend and frontend to production

## Quick Commands Reference

```bash
# Check IOTA CLI version
iota --version

# Check active environment
iota client active-env

# Check your address
iota client active-address

# Check balance
iota client gas

# Request tokens
iota client faucet

# Build contracts
iota move build

# Deploy contracts
iota client publish --gas-budget 100000000

# View environments
iota client envs

# Switch environment
iota client switch --env testnet
```

## Resources

- **IOTA Explorer**: https://explorer.iota.cafe/?network=testnet
- **IOTA Docs**: https://wiki.iota.org/
- **IOTA GitHub**: https://github.com/iotaledger/iota
- **IOTA Discord**: https://discord.iota.org

---

**Ready to start?** Run the automated script or follow the manual steps above!
