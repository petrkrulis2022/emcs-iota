#!/usr/bin/env node

const { IotaClient } = require('@iota/iota-sdk/client');

async function getTransactionDetails() {
  const client = new IotaClient({ url: 'https://api.testnet.iota.cafe:443' });
  
  const txDigest = '3BEWkH5GTNP5WeidbanBQxy5DYs7go4H2TvgXNnUcuzf';
  
  console.log('Fetching transaction details...\n');
  
  const tx = await client.getTransactionBlock({
    digest: txDigest,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showEvents: true,
      showInput: true,
    },
  });
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('TRANSACTION DETAILS');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('Digest:', tx.digest);
  console.log('Sender:', tx.transaction?.data?.sender);
  console.log('\n');
  
  if (tx.objectChanges) {
    console.log('OBJECT CHANGES:\n');
    tx.objectChanges.forEach((change, i) => {
      console.log(`${i + 1}. Type: ${change.type}`);
      if (change.type === 'published') {
        console.log(`   📦 PACKAGE ID: ${change.packageId}`);
        console.log(`   Version: ${change.version}`);
        console.log(`   ⭐ USE THIS IN backend/.env`);
      } else if (change.type === 'created') {
        console.log(`   Object ID: ${change.objectId}`);
        console.log(`   Object Type: ${change.objectType}`);
        if (change.objectType && change.objectType.includes('operator_registry')) {
          console.log(`   ⭐ OPERATOR_REGISTRY_ID - USE THIS IN backend/.env`);
        }
      }
      console.log('');
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('COPY THESE TO backend/.env:');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const published = tx.objectChanges?.find(c => c.type === 'published');
  const registry = tx.objectChanges?.find(c => 
    c.type === 'created' && c.objectType && c.objectType.includes('operator_registry')
  );
  
  if (published) {
    console.log(`IOTA_RPC_URL=https://api.testnet.iota.cafe:443`);
    console.log(`CONTRACT_PACKAGE_ID=${published.packageId}`);
    if (registry) {
      console.log(`OPERATOR_REGISTRY_ID=${registry.objectId}`);
    }
    console.log('');
  }
}

getTransactionDetails().catch(console.error);
