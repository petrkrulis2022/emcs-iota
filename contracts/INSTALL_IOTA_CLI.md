# IOTA CLI Installation Guide

The standard install script may not work in all environments. Here are multiple methods to install the IOTA CLI.

## Option 1: Build from Source with Rust/Cargo (Most Reliable - RECOMMENDED)

This is the most reliable method for WSL/Ubuntu/Linux:

```bash
# Step 1: Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Step 2: Clone IOTA repository
git clone https://github.com/iotaledger/iota.git ~/iota-cli
cd ~/iota-cli

# Step 3: Build and install IOTA CLI
cargo install --path crates/iota-cli --locked

# Step 4: Verify installation
iota --version

# Step 5: Add to PATH permanently (if needed)
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

This method:
- ✅ Builds from official source
- ✅ Works on all Linux/WSL/Mac systems
- ✅ Automatically handles dependencies
- ✅ Most up-to-date version

## Option 2: Install via NPM (Faster if you have Node.js)

If you already have Node.js/npm installed:

```bash
# Install globally
npm install -g @iota/cli

# Verify
iota --version
```

## Option 3: Direct Binary Download

```bash
# Create directory
mkdir -p ~/.iota/bin
cd ~/.iota/bin

# Download pre-built binary for Linux (WSL/Ubuntu)
curl -L https://github.com/iotaledger/iota/releases/latest/download/iota-x86_64-unknown-linux-gnu -o iota

# Make it executable
chmod +x iota

# Add to PATH
export PATH="$HOME/.iota/bin:$PATH"

# Verify
iota --version
```

## Option 4: Check if Already Installed

Before installing, check if IOTA CLI is already available:

```bash
# Check if iota command exists
which iota

# Try running it
iota --version

# Check common installation locations
ls -la ~/.iota/bin/
ls -la ~/.cargo/bin/iota
```

## Option 5: Docker (Quick Workaround)

If you just need to deploy quickly:

```bash
# Pull IOTA Docker image
docker pull iotaledger/iota:latest

# Run IOTA CLI from Docker
docker run --rm iotaledger/iota:latest --version

# Deploy contracts using Docker
docker run --rm -v $(pwd):/workspace \
  iotaledger/iota:latest \
  move publish /workspace/contracts
```

## Option 6: Windows (Not WSL)

Download directly from: https://releases.iota.org/

Then add to Windows PATH manually.

## Make PATH Persistent

After installation, add to your `.bashrc` so it persists across sessions:

```bash
echo 'export PATH="$HOME/.iota/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Verify Installation

```bash
# Check version
iota --version

# Check client environments
iota client envs

# Check addresses
iota client addresses
```

You should see version info and your client environments.

## Connect to IOTA Testnet

After successful installation:

```bash
# Set up testnet
iota client new-env --rpc "https://testnet.iota.org:443" --alias testnet

# Switch to testnet
iota client switch --env testnet

# Create wallet (SAVE YOUR RECOVERY PHRASE!)
iota client new-address ed25519

# Get your address
iota client addresses

# Get testnet tokens
iota client faucet

# Check balance
iota client gas
```

## Troubleshooting

### "iota: command not found" after installation

Check if it's in the right place:
```bash
# Check if binary exists
ls -la ~/.iota/bin/iota

# Try full path
~/.iota/bin/iota --version

# Check PATH
echo $PATH
```

If the binary exists but command not found, add to PATH:
```bash
export PATH="$HOME/.iota/bin:$PATH"
```

### Installation script fails

Try Option 3 (Direct Binary Download) - it's the most reliable.

### Wrong architecture

If you get "cannot execute binary file", you may need a different architecture:

**For Mac (Intel):**
```bash
curl -L https://github.com/iotaledger/iota/releases/latest/download/iota-x86_64-apple-darwin -o ~/.iota/bin/iota
```

**For Mac (Apple Silicon/M1/M2):**
```bash
curl -L https://github.com/iotaledger/iota/releases/latest/download/iota-aarch64-apple-darwin -o ~/.iota/bin/iota
```

**For Linux (ARM):**
```bash
curl -L https://github.com/iotaledger/iota/releases/latest/download/iota-aarch64-unknown-linux-gnu -o ~/.iota/bin/iota
```

### Network issues

If downloads fail, try:
```bash
# Use different mirror or wait a moment
# Or download manually from GitHub releases page
# https://github.com/iotaledger/iota/releases
```

## Next Steps

Once IOTA CLI is installed and working:

1. ✅ Verify: `iota --version`
2. ⏭️ Configure testnet (see above)
3. ⏭️ Get testnet tokens
4. ⏭️ Deploy contracts: `cd contracts && ./deploy.sh`

## Quick Test

Run this to verify everything works:
```bash
iota --version && echo "✅ IOTA CLI installed successfully!"
```

If you see the version number and success message, you're ready to deploy!
