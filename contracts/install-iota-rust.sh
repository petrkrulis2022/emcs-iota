#!/bin/bash

# IOTA CLI Installation Script using Rust/Cargo
# This is the most reliable method for Linux/WSL/Mac

set -e

echo "======================================"
echo "IOTA CLI Installation (Rust/Cargo)"
echo "======================================"
echo ""

# Check if iota is already installed
if command -v iota &> /dev/null; then
    echo "✅ IOTA CLI is already installed!"
    iota --version
    echo ""
    read -p "Do you want to reinstall? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping installation."
        exit 0
    fi
fi

# Step 1: Check if Rust is installed
echo "Step 1: Checking Rust installation..."
echo ""

if command -v cargo &> /dev/null; then
    echo "✅ Rust is already installed"
    rustc --version
    cargo --version
else
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    
    # Source cargo env
    source $HOME/.cargo/env
    
    echo "✅ Rust installed successfully"
    rustc --version
    cargo --version
fi

echo ""
echo "======================================"
echo "Step 2: Cloning IOTA Repository"
echo "======================================"
echo ""

# Remove old clone if exists
if [ -d "$HOME/iota-cli" ]; then
    echo "Removing old IOTA repository..."
    rm -rf "$HOME/iota-cli"
fi

# Clone IOTA repository
echo "Cloning IOTA repository..."
git clone https://github.com/iotaledger/iota.git "$HOME/iota-cli"

echo "✅ Repository cloned"

echo ""
echo "======================================"
echo "Step 3: Building IOTA CLI"
echo "======================================"
echo ""
echo "This may take 5-10 minutes..."
echo ""

cd "$HOME/iota-cli"

# Build and install (the CLI is in crates/iota, not crates/iota-cli)
cargo install --path crates/iota --locked

echo ""
echo "✅ IOTA CLI built and installed"

echo ""
echo "======================================"
echo "Step 4: Verifying Installation"
echo "======================================"
echo ""

# Add to PATH for current session
export PATH="$HOME/.cargo/bin:$PATH"

# Verify installation
if command -v iota &> /dev/null; then
    echo "✅ IOTA CLI installed successfully!"
    echo ""
    iota --version
    echo ""
else
    echo "❌ Installation verification failed"
    echo "Please check the error messages above"
    exit 1
fi

echo ""
echo "======================================"
echo "Step 5: Adding to PATH"
echo "======================================"
echo ""

# Add to .bashrc if not already there
if ! grep -q '.cargo/bin' ~/.bashrc; then
    echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
    echo "✅ Added to ~/.bashrc"
else
    echo "✅ Already in ~/.bashrc"
fi

# Source bashrc
source ~/.bashrc 2>/dev/null || true

echo ""
echo "======================================"
echo "✅ Installation Complete!"
echo "======================================"
echo ""
echo "IOTA CLI is now installed and ready to use."
echo ""
echo "Next steps:"
echo "1. Configure testnet: iota client new-env --rpc \"https://testnet.iota.org:443\" --alias testnet"
echo "2. Switch to testnet: iota client switch --env testnet"
echo "3. Create wallet: iota client new-address ed25519"
echo "4. Get tokens: iota client faucet"
echo "5. Deploy contracts: cd contracts && ./deploy.sh"
echo ""
echo "For detailed instructions, see DEPLOYMENT_INSTRUCTIONS.md"
echo ""

# Cleanup
echo "Cleaning up..."
rm -rf "$HOME/iota-cli"
echo "✅ Cleanup complete"
echo ""

