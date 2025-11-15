#!/usr/bin/env node

/**
 * Deploy EMCS contracts to IOTA testnet using IOTA SDK
 * 
 * This script deploys the Move contracts directly using the IOTA SDK
 * without requiring the CLI or web interface login.
 * 
 * Usage:
 *   node deploy-with-sdk.js
 * 
 * The script will use the Sui wallet keystore file automatically.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

async function deployContracts() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   EMCS IOTA Contract Deployment via SDK               ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Import Sui SDK (works with IOTA)
    const { SuiClient } = require('@mysten/sui/client');
    const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
    const { Transaction } = require('@mysten/sui/transactions');
    const { fromBase64 } = require('@mysten/sui/utils');

    console.log('📡 Step 1: Connecting to IOTA testnet...');
    
    // Connect to IOTA testnet
    const client = new SuiClient({ 
      url: 'https://api.testnet.iota.cafe:443'
    });

    console.log('✅ Connected to IOTA testnet\n');

    // Step 2: Load wallet keypair
    console.log('🔑 Step 2: Loading wallet keypair...');
    
    let keypair;
    
    // Check for environment variable first
    const privateKeyFromEnv = process.env.IOTA_PRIVATE_KEY;
    
    if (privateKeyFromEnv) {
      console.log('   Using private key from environment variable');
      
      // Parse the bech32 private key (iotaprivkey1... or suiprivkey1...)
      if (privateKeyFromEnv.startsWith('iotaprivkey1') || privateKeyFromEnv.startsWith('suiprivkey1')) {
        try {
          const { bech32 } = require('bech32');
          
          // Decode the bech32 key
          const decoded = bech32.decode(privateKeyFromEnv);
          const privateKeyBytes = Buffer.from(bech32.fromWords(decoded.words));
          
          // The first byte is the key scheme flag (0 for Ed25519)
          const secretKey = privateKeyBytes.slice(1);
          
          keypair = Ed25519Keypair.fromSecretKey(secretKey);
          
          const address = keypair.getPublicKey().toSuiAddress();
          console.log(`✅ Loaded wallet address: ${address}`);
          console.log(`   Expected address: 0x5d3b4d49f8260a11a31fe73cda9a43a0f92f3e734d808a3481169aeb3cf6c54a\n`);
          
        } catch (e) {
          console.error('❌ Failed to decode private key:', e.message);
          console.error('   Please check your private key format');
          process.exit(1);
        }
      } else {
        console.error('❌ Invalid private key format. Expected format: iotaprivkey1... or suiprivkey1...');
        process.exit(1);
      }
      
    } else {
      // Try to load from Sui keystore (fallback)
      const keystorePath = path.join(os.homedir(), '.sui', 'sui_config', 'sui.keystore');
      
      if (fs.existsSync(keystorePath)) {
        console.log(`   Found keystore: ${keystorePath}`);
        const keystore = JSON.parse(fs.readFileSync(keystorePath, 'utf8'));
        
        // Use the first key (or specify which one)
        const privateKeyBase64 = keystore[0];
        
        // Remove the flag byte (first byte indicates key type)
        const privateKeyBytes = fromBase64(privateKeyBase64);
        const keyPairBytes = privateKeyBytes.slice(1); // Remove scheme flag
        
        keypair = Ed25519Keypair.fromSecretKey(keyPairBytes);
        
        const address = keypair.getPublicKey().toSuiAddress();
        console.log(`✅ Loaded wallet address: ${address}\n`);
      } else {
        console.error('❌ No wallet found!');
        console.error('   Set IOTA_PRIVATE_KEY environment variable');
        console.error('   export IOTA_PRIVATE_KEY="iotaprivkey1..."');
        process.exit(1);
      }
    }
    
    // Check balance
    console.log('💰 Step 3: Checking gas balance...');
    const address = keypair.getPublicKey().toSuiAddress();
    try {
      const balance = await client.getBalance({
        owner: address,
      });
      console.log(`   Balance: ${balance.totalBalance} IOTA (${(Number(balance.totalBalance) / 1e9).toFixed(2)} IOTA)`);
      
      if (BigInt(balance.totalBalance) < BigInt(100000000)) {
        console.warn('   ⚠️  Low balance! You may need more testnet tokens.');
        console.warn('   Get tokens from: https://faucet.testnet.iota.cafe/\n');
      } else {
        console.log('✅ Sufficient balance for deployment\n');
      }
    } catch (balanceError) {
      console.warn('   ⚠️  Could not check balance (API may not support this call)');
      console.warn('   Proceeding with deployment...\n');
    }

    // Step 4: Read compiled modules
    console.log('📦 Step 4: Reading compiled contract modules...');
    const buildPath = path.join(__dirname, 'build', 'emcs_contracts');
    
    if (!fs.existsSync(buildPath)) {
      console.error('❌ Build directory not found!');
      console.error('   Run: sui move build');
      process.exit(1);
    }

    const bytecodeModulesPath = path.join(buildPath, 'bytecode_modules');
    const moduleFiles = fs.readdirSync(bytecodeModulesPath);
    
    console.log(`   Found ${moduleFiles.length} modules:`);
    const modules = [];
    
    for (const file of moduleFiles) {
      if (file.endsWith('.mv')) {
        const modulePath = path.join(bytecodeModulesPath, file);
        const moduleBytes = Array.from(fs.readFileSync(modulePath));
        modules.push(moduleBytes);
        console.log(`   ✓ ${file} (${moduleBytes.length} bytes)`);
      }
    }
    console.log('');

    // Step 5: Build publish transaction
    console.log('🚀 Step 5: Building publish transaction...');
    
    const tx = new Transaction();
    
    // Set gas budget and price manually (IOTA API doesn't support getReferenceGasPrice)
    tx.setGasBudget(100000000);
    tx.setGasPrice(1000); // Set a reasonable gas price
    
    const [upgradeCap] = tx.publish({
      modules,
      dependencies: [
        '0x0000000000000000000000000000000000000000000000000000000000000001', // std
        '0x0000000000000000000000000000000000000000000000000000000000000002', // sui
      ],
    });
    
    // Transfer the upgrade capability to sender
    tx.transferObjects([upgradeCap], keypair.getPublicKey().toSuiAddress());
    
    console.log('✅ Transaction built\n');

    // Step 6: Execute deployment
    console.log('⏳ Step 6: Executing deployment transaction...');
    console.log('   This may take 10-30 seconds...\n');
    
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });

    console.log('✅ Transaction executed!\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // Step 7: Extract deployment info
    console.log('📋 DEPLOYMENT RESULTS:\n');
    
    console.log(`Transaction Digest: ${result.digest}`);
    console.log(`Explorer: https://explorer.iota.cafe/txblock/${result.digest}?network=testnet\n`);

    // Find Package ID
    const publishedPackage = result.objectChanges?.find(
      change => change.type === 'published'
    );
    
    if (publishedPackage) {
      console.log('✅ Package Published:');
      console.log(`   Package ID: ${publishedPackage.packageId}`);
      console.log(`   Version: ${publishedPackage.version}\n`);
    }

    // Find created objects (Registry, etc.)
    const createdObjects = result.objectChanges?.filter(
      change => change.type === 'created'
    );
    
    if (createdObjects && createdObjects.length > 0) {
      console.log('✅ Created Objects:');
      createdObjects.forEach(obj => {
        console.log(`   Object ID: ${obj.objectId}`);
        console.log(`   Type: ${obj.objectType}`);
        if (obj.objectType.includes('operator_registry')) {
          console.log(`   ⭐ This is the OPERATOR_REGISTRY_ID`);
        }
        console.log('');
      });
    }

    // Save deployment info
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      network: 'iota-testnet',
      transactionDigest: result.digest,
      packageId: publishedPackage?.packageId,
      version: publishedPackage?.version,
      createdObjects: createdObjects?.map(obj => ({
        objectId: obj.objectId,
        objectType: obj.objectType,
      })),
      explorerUrl: `https://explorer.iota.cafe/txblock/${result.digest}?network=testnet`,
    };

    const outputPath = path.join(__dirname, 'deployment-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to: ${outputPath}\n`);

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🎉 DEPLOYMENT SUCCESSFUL!\n');
    
    console.log('📝 Next Steps:\n');
    console.log('1. Update backend/.env with:\n');
    console.log(`   IOTA_RPC_URL=https://api.testnet.iota.cafe:443`);
    console.log(`   CONTRACT_PACKAGE_ID=${publishedPackage?.packageId || '<package_id>'}`);
    
    const registryObj = createdObjects?.find(obj => 
      obj.objectType.includes('operator_registry')
    );
    if (registryObj) {
      console.log(`   OPERATOR_REGISTRY_ID=${registryObj.objectId}`);
    }
    console.log('');
    
    console.log('2. View on Explorer:');
    console.log(`   https://explorer.iota.cafe/object/${publishedPackage?.packageId}?network=testnet\n`);

  } catch (error) {
    console.error('\n❌ Deployment failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('Insufficient')) {
      console.error('\n💡 Solution: Get testnet tokens from faucet');
      console.error('   https://faucet.testnet.iota.cafe/');
    }
    
    if (error.message.includes('version')) {
      console.error('\n💡 Try updating @mysten/sui.js:');
      console.error('   npm install @mysten/sui.js@latest');
    }
    
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run deployment
deployContracts();
