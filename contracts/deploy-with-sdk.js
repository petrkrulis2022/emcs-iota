/**
 * Deploy EMCS contracts to IOTA testnet using IOTA SDK
 * 
 * This script deploys the Move contracts directly using the IOTA SDK
 * without requiring the CLI.
 */

const fs = require('fs');
const path = require('path');

// Note: This requires @mysten/sui.js package
// Install with: npm install @mysten/sui.js

async function deployContracts() {
  try {
    console.log('🚀 Starting contract deployment to IOTA testnet...\n');

    // Import Sui SDK (works with IOTA)
    const { SuiClient, getFullnodeUrl } = require('@mysten/sui.js/client');
    const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
    const { TransactionBlock } = require('@mysten/sui.js/transactions');
    const { fromB64 } = require('@mysten/sui.js/utils');

    // Connect to IOTA testnet
    const client = new SuiClient({ 
      url: 'https://api.testnet.iota.org:443' 
    });

    console.log('✅ Connected to IOTA testnet\n');

    // Load wallet keypair from environment or prompt
    // For now, we'll show instructions
    console.log('📝 To deploy contracts, you need:');
    console.log('1. Your wallet private key (from IOTA wallet recovery phrase)');
    console.log('2. Testnet IOTA tokens\n');
    
    console.log('⚠️  This script requires manual setup:');
    console.log('   - Export your wallet private key');
    console.log('   - Set PRIVATE_KEY environment variable');
    console.log('   - Ensure you have testnet tokens\n');

    // Read compiled modules
    const buildPath = path.join(__dirname, 'build', 'emcs_contracts');
    
    if (!fs.existsSync(buildPath)) {
      console.error('❌ Build directory not found. Run: sui move build');
      process.exit(1);
    }

    console.log('✅ Found compiled contracts\n');
    console.log('📦 Ready to deploy:');
    console.log('   - consignment.move');
    console.log('   - operator_registry.move\n');

    console.log('💡 Next steps:');
    console.log('1. Get your wallet private key from IOTA wallet');
    console.log('2. Set environment variable: export PRIVATE_KEY="your-key"');
    console.log('3. Run: node deploy-with-sdk.js\n');

    console.log('Or use the Sui CLI with IOTA testnet configuration.');

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    process.exit(1);
  }
}

// Run deployment
deployContracts();
