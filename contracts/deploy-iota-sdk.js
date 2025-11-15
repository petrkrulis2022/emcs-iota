#!/usr/bin/env node

/**
 * Deploy EMCS Contracts to IOTA Testnet using Official IOTA SDK
 * 
 * Uses @iota/iota-sdk package specifically designed for IOTA blockchain
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

async function deployContracts() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   EMCS IOTA Contract Deployment (Official IOTA SDK)   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Import IOTA SDK
    const { IotaClient } = require('@iota/iota-sdk/client');
    const { Ed25519Keypair } = require('@iota/iota-sdk/keypairs/ed25519');
    const { Transaction } = require('@iota/iota-sdk/transactions');
    const { fromBase64 } = require('@iota/iota-sdk/utils');
    const { bech32 } = require('bech32');

    console.log('📡 Step 1: Connecting to IOTA testnet...');
    
    // Connect to IOTA testnet using official SDK
    const client = new IotaClient({ 
      url: 'https://api.testnet.iota.cafe:443'
    });

    console.log('✅ Connected to IOTA testnet\n');

    // Step 2: Load wallet keypair
    console.log('🔑 Step 2: Loading wallet keypair...');
    
    let keypair;
    const privateKeyFromEnv = process.env.IOTA_PRIVATE_KEY;
    
    if (privateKeyFromEnv && privateKeyFromEnv.startsWith('iotaprivkey1')) {
      console.log('   Using IOTA private key from environment variable');
      
      try {
        // Decode the bech32 IOTA private key
        const decoded = bech32.decode(privateKeyFromEnv);
        const privateKeyBytes = Buffer.from(bech32.fromWords(decoded.words));
        
        // The first byte is the key scheme flag (0 for Ed25519)
        const secretKey = privateKeyBytes.slice(1);
        
        keypair = Ed25519Keypair.fromSecretKey(secretKey);
        
        const address = keypair.getPublicKey().toIotaAddress();
        console.log(`✅ Loaded wallet address: ${address}`);
        console.log(`   Expected: 0x5d3b4d49f8260a11a31fe73cda9a43a0f92f3e734d808a3481169aeb3cf6c54a\n`);
        
      } catch (e) {
        console.error('❌ Failed to decode IOTA private key:', e.message);
        process.exit(1);
      }
    } else {
      console.error('❌ IOTA_PRIVATE_KEY environment variable not set');
      console.error('   Set it with: export IOTA_PRIVATE_KEY="iotaprivkey1..."');
      process.exit(1);
    }

    // Step 3: Check balance
    console.log('💰 Step 3: Checking gas balance...');
    const address = keypair.getPublicKey().toIotaAddress();
    
    try {
      const balance = await client.getBalance({ owner: address });
      const balanceInIOTA = (Number(balance.totalBalance) / 1e9).toFixed(2);
      console.log(`   Balance: ${balance.totalBalance} (${balanceInIOTA} IOTA)`);
      
      if (BigInt(balance.totalBalance) < BigInt(100000000)) {
        console.warn('   ⚠️  Low balance! Minimum 0.1 IOTA recommended for deployment.');
      } else {
        console.log('✅ Sufficient balance for deployment\n');
      }
    } catch (balanceError) {
      console.log('   ⚠️  Could not check balance, proceeding...\n');
    }

    // Step 4: Read compiled modules
    console.log('📦 Step 4: Reading compiled contract modules...');
    const buildPath = path.join(__dirname, 'build', 'emcs_contracts');
    
    if (!fs.existsSync(buildPath)) {
      console.error('❌ Build directory not found!');
      console.error('   Run: sui move build (or iota move build)');
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
    
    const [upgradeCap] = tx.publish({
      modules,
      dependencies: [
        '0x0000000000000000000000000000000000000000000000000000000000000001', // std
        '0x0000000000000000000000000000000000000000000000000000000000000002', // iota framework
      ],
    });
    
    // Transfer the upgrade capability to sender
    tx.transferObjects([upgradeCap], address);
    
    console.log('✅ Transaction built\n');

    // Step 6: Execute deployment
    console.log('⏳ Step 6: Executing deployment transaction...');
    console.log('   This may take 10-30 seconds...\n');
    
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
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

    // Find created objects
    const createdObjects = result.objectChanges?.filter(
      change => change.type === 'created'
    );
    
    if (createdObjects && createdObjects.length > 0) {
      console.log('✅ Created Objects:');
      createdObjects.forEach(obj => {
        console.log(`   Object ID: ${obj.objectId}`);
        console.log(`   Type: ${obj.objectType}`);
        if (obj.objectType && obj.objectType.includes('operator_registry')) {
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
      obj.objectType && obj.objectType.includes('operator_registry')
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
    
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run deployment
deployContracts();
