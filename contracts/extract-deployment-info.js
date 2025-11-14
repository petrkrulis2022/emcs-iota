#!/usr/bin/env node

/**
 * Extract deployment information from Sui deployment output
 * Usage: node extract-deployment-info.js deploy_output.json
 */

const fs = require('fs');
const path = require('path');

// Check if file argument provided
if (process.argv.length < 3) {
    console.error('Usage: node extract-deployment-info.js <deploy_output.json>');
    process.exit(1);
}

const deployFile = process.argv[2];

// Read deployment output
if (!fs.existsSync(deployFile)) {
    console.error(`Error: File ${deployFile} not found`);
    process.exit(1);
}

const deployOutput = JSON.parse(fs.readFileSync(deployFile, 'utf8'));

// Extract Package ID
const publishedObject = deployOutput.objectChanges?.find(obj => obj.type === 'published');
const packageId = publishedObject?.packageId;

// Extract Operator Registry ID
const registryObject = deployOutput.objectChanges?.find(obj => 
    obj.objectType?.includes('operator_registry::OperatorRegistry')
);
const registryId = registryObject?.objectId;

// Display results
console.log('\n========================================');
console.log('Deployment Information Extracted');
console.log('========================================\n');

if (packageId) {
    console.log('📦 Package ID:');
    console.log(`   ${packageId}`);
} else {
    console.log('❌ Package ID not found');
}

if (registryId) {
    console.log('\n🗂️  Operator Registry ID:');
    console.log(`   ${registryId}`);
} else {
    console.log('\n❌ Operator Registry ID not found');
}

console.log('\n🔗 Explorer Links:');
if (packageId) {
    console.log(`   Package: https://suiscan.xyz/testnet/object/${packageId}`);
}
if (registryId) {
    console.log(`   Registry: https://suiscan.xyz/testnet/object/${registryId}`);
}

// Generate .env content
console.log('\n========================================');
console.log('Backend .env Configuration');
console.log('========================================\n');

const envContent = `# Server Configuration
PORT=3000

# IOTA Configuration
IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
CONTRACT_PACKAGE_ID=${packageId || 'YOUR_PACKAGE_ID_HERE'}
OPERATOR_REGISTRY_ID=${registryId || 'YOUR_REGISTRY_ID_HERE'}

# CORS Configuration
FRONTEND_URL=http://localhost:5173
`;

console.log(envContent);

// Optionally write to backend/.env
const envPath = path.join(__dirname, '..', 'backend', '.env');
const shouldWrite = process.argv.includes('--write');

if (shouldWrite && packageId && registryId) {
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Written to ${envPath}\n`);
} else if (shouldWrite) {
    console.log('⚠️  Not writing to .env - missing Package ID or Registry ID\n');
} else {
    console.log('💡 To automatically write to backend/.env, run:');
    console.log(`   node extract-deployment-info.js ${deployFile} --write\n`);
}
