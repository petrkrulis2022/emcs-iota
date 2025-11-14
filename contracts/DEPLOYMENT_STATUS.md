# Deployment Status

## Build Status: ✅ Complete

The Move contracts have been successfully built with the following modules:

### Modules
1. **emcs::consignment** - Main consignment NFT and lifecycle management
2. **emcs::operator_registry** - Operator authorization management

## Deployment Status: ⏳ Ready to Deploy to IOTA Testnet

### Prerequisites Status
- [ ] IOTA CLI installed - **ACTION REQUIRED**
- [ ] IOTA CLI configured with testnet - **ACTION REQUIRED**
- [ ] Wallet with testnet tokens - **ACTION REQUIRED**
- [x] Deployment scripts created
- [x] Documentation prepared

### Quick Start

1. **Install IOTA CLI**
   ```bash
   curl https://releases.iota.org/install.sh | bash
   ```

2. **Configure IOTA Client**
   ```bash
   iota client new-env --rpc "https://api.testnet.iota.cafe:443" --alias testnet
   iota client switch --env testnet
   iota client new-address ed25519
   ```

3. **Get Testnet Tokens**
   ```bash
   iota client faucet
   ```

4. **Deploy Contracts**
   ```bash
   cd contracts
   iota move build
   iota client publish --gas-budget 100000000 --json > deploy_output.json
   ```

See `DEPLOYMENT_INSTRUCTIONS.md` for detailed guide.
See `QUICK_DEPLOY.md` for quick reference.

## Important: IOTA vs Sui

This project uses **IOTA's Move implementation**, not Sui.
- ✅ Use `iota` CLI commands
- ✅ Use IOTA testnet: `https://api.testnet.iota.cafe:443`
- ✅ Use IOTA explorer: `https://explorer.iota.cafe/?network=testnet`
- ❌ Don't use `sui` commands or Sui endpoints

## Resources
- IOTA Explorer: https://explorer.iota.cafe/?network=testnet
- IOTA Docs: https://wiki.iota.org/
- IOTA Discord: https://discord.iota.org
