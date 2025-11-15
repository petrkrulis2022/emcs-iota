#!/usr/bin/env node

/**
 * Deploy EMCS Enhanced Contracts to IOTA Testnet
 * 
 * Deploys:
 * - consignment_enhanced.move
 * - operator_registry.move
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function deployContracts() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   EMCS IOTA Contract Deployment                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Verify build
    console.log('📋 Step 1: Verifying contract build...');
    const buildPath = path.join(__dirname, 'build', 'emcs_contracts');
    
    if (!fs.existsSync(buildPath)) {
      console.log('⚠️  Contracts not built. Building now...');
      execSync('sui move build', { 
        cwd: __dirname, 
        stdio: 'inherit' 
      });
    } else {
      console.log('✅ Contracts already built\n');
    }

    // Step 2: Check which contracts are included
    console.log('📦 Step 2: Checking contract modules...');
    const sourcesPath = path.join(__dirname, 'sources');
    const moveFiles = fs.readdirSync(sourcesPath).filter(f => f.endsWith('.move'));
    
    console.log('   Modules found:');
    moveFiles.forEach(file => {
      console.log(`   ✓ ${file}`);
    });
    console.log('');

    // Step 3: Deployment instructions
    console.log('🚀 Step 3: Ready to deploy!\n');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('⚠️  IOTA CLI has library compatibility issues on this system.');
    console.log('    Using alternative deployment method:\n');
    
    console.log('🔧 OPTION 1: Deploy via Sui CLI (Works with IOTA testnet)\n');
    console.log('   Install Sui CLI:');
    console.log('   $ cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui\n');
    console.log('   Configure for IOTA:');
    console.log('   $ sui client new-env --rpc "https://api.testnet.iota.cafe:443" --alias iota-testnet');
    console.log('   $ sui client switch --env iota-testnet\n');
    console.log('   Deploy:');
    console.log('   $ cd contracts');
    console.log('   $ sui client publish --gas-budget 100000000 --json > deploy_output.json\n');

    console.log('🔧 OPTION 2: Deploy via IOTA SDK (Programmatic)\n');
    console.log('   The SDK is installed. You need:');
    console.log('   1. Your wallet private key');
    console.log('   2. Testnet IOTA tokens from faucet\n');
    console.log('   Set environment variable:');
    console.log('   $ export IOTA_PRIVATE_KEY="your-private-key-base64"\n');
    console.log('   Then run the SDK deployment (requires key setup)\n');

    console.log('🔧 OPTION 3: Deploy via IOTA Web Interface\n');
    console.log('   1. Go to: https://explorer.iota.cafe/');
    console.log('   2. Connect your wallet');
    console.log('   3. Use "Publish Package" feature');
    console.log('   4. Upload build/emcs_contracts folder\n');

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📝 After deployment, update backend/.env with:\n');
    console.log('   IOTA_RPC_URL=https://api.testnet.iota.cafe:443');
    console.log('   CONTRACT_PACKAGE_ID=<your_package_id>');
    console.log('   OPERATOR_REGISTRY_ID=<your_registry_id>\n');

    console.log('✅ Deployment preparation complete!\n');

    // Offer to show build info
    console.log('💡 Tip: Check BuildInfo.yaml for module details:');
    const buildInfoPath = path.join(buildPath, 'BuildInfo.yaml');
    if (fs.existsSync(buildInfoPath)) {
      const buildInfo = fs.readFileSync(buildInfoPath, 'utf8');
      console.log('\n' + buildInfo.substring(0, 500) + '...\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run deployment preparation
deployContracts();
