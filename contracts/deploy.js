/**
 * Deploy EMCS contracts to IOTA testnet
 * Usage: node deploy.js <private-key>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const fetch = require('node-fetch');

// Polyfill fetch for the Sui SDK
global.fetch = fetch;

async function deployContracts() {
  try {
    console.log('🚀 EMCS Contract Deployment to IOTA Testnet\n');

    // Get private key from command line argument
    const privateKey = process.argv[2];
    
    if (!privateKey) {
      console.error('❌ Error: Private key required');
      console.log('\nUsage: node deploy.js <your-private-key>');
      console.log('\nTo get your private key from Sui wallet:');
      console.log('1. Export your wallet: sui keytool export <address>');
      console.log('2. Or use your recovery phrase to derive the key\n');
      process.exit(1);
    }

    // Import Sui SDK
    const { SuiClient } = require('@mysten/sui.js/client');
    const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
    const { TransactionBlock } = require('@mysten/sui.js/transactions');
    const { fromHEX, fromB64 } = require('@mysten/sui.js/utils');

    console.log('📡 Connecting to IOTA testnet...');
    
    // Connect to IOTA testnet - use the working URL
    const url = 'https://api.testnet.iota.cafe:443';
    console.log(`   Using: ${url}`);
    const client = new SuiClient({ url });

    console.log('✅ Connected to IOTA testnet\n');

    // Create keypair from private key
    let keypair;
    try {
      if (privateKey.includes(' ')) {
        // Mnemonic phrase
        keypair = Ed25519Keypair.deriveKeypair(privateKey);
      } else {
        // Try as base64 - remove the first byte (flag byte) if it's 33 bytes
        let keyBytes = fromB64(privateKey);
        if (keyBytes.length === 33) {
          // Remove the first byte (scheme flag)
          keyBytes = keyBytes.slice(1);
        }
        keypair = Ed25519Keypair.fromSecretKey(keyBytes);
      }
    } catch (error) {
      console.error('❌ Invalid private key format:', error.message);
      console.log('\nExpected formats:');
      console.log('  - Base64: AKO/3CG5Wlh7...');
      console.log('  - Mnemonic: word1 word2 ...\n');
      process.exit(1);
    }

    const address = keypair.getPublicKey().toSuiAddress();
    console.log('👛 Wallet address:', address);

    // Skip balance check due to network issues - proceed with deployment
    console.log('\n⚠️  Skipping balance check (network issues)');
    console.log('   Proceeding with deployment...');

    // Read compiled bytecode
    console.log('\n📦 Reading compiled contracts...');
    const modulesPath = path.join(__dirname, 'build', 'emcs_contracts', 'bytecode_modules');
    
    if (!fs.existsSync(modulesPath)) {
      console.error('❌ Compiled modules not found. Run: sui move build');
      process.exit(1);
    }

    const modules = fs.readdirSync(modulesPath)
      .filter(f => f.endsWith('.mv'))
      .map(f => {
        const modulePath = path.join(modulesPath, f);
        return Array.from(fs.readFileSync(modulePath));
      });

    console.log(`✅ Found ${modules.length} compiled modules`);

    // Create transaction
    console.log('\n🔨 Creating deployment transaction...');
    const tx = new TransactionBlock();
    const [upgradeCap] = tx.publish({
      modules,
      dependencies: [
        '0x1', // Stdlib
        '0x2', // Sui framework
      ],
    });

    // Transfer upgrade capability to sender
    tx.transferObjects([upgradeCap], tx.pure(address));

    // Execute transaction
    console.log('📤 Submitting transaction to IOTA testnet...');
    console.log('⏳ This may take 10-30 seconds...\n');

    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    console.log('✅ Deployment successful!\n');
    console.log('📋 Transaction Details:');
    console.log('   Digest:', result.digest);
    console.log('   Status:', result.effects.status.status);

    // Extract package ID and created objects
    const packageId = result.objectChanges?.find(
      (change) => change.type === 'published'
    )?.packageId;

    const createdObjects = result.objectChanges?.filter(
      (change) => change.type === 'created'
    );

    console.log('\n📦 Deployed Package:');
    console.log('   Package ID:', packageId);

    console.log('\n🎯 Created Objects:');
    createdObjects?.forEach((obj) => {
      console.log(`   - ${obj.objectType}`);
      console.log(`     Object ID: ${obj.objectId}`);
    });

    // Find OperatorRegistry
    const operatorRegistry = createdObjects?.find(
      (obj) => obj.objectType?.includes('operator_registry::OperatorRegistry')
    );

    console.log('\n🔑 Important IDs for Backend Configuration:');
    console.log('   CONTRACT_PACKAGE_ID=' + packageId);
    if (operatorRegistry) {
      console.log('   OPERATOR_REGISTRY_ID=' + operatorRegistry.objectId);
    }

    console.log('\n🌐 View on Explorer:');
    console.log(`   https://explorer.iota.org/txblock/${result.digest}?network=testnet`);

    console.log('\n✅ Deployment complete! Update your backend/.env file with the IDs above.\n');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run deployment
deployContracts();
