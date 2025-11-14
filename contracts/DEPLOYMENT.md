# EMCS Contracts Deployment Guide

## Prerequisites

1. **Sui CLI installed** - Install from: https://docs.sui.io/guides/developer/getting-started/sui-install
2. **Testnet wallet with tokens** - Get tokens from: https://discord.com/channels/916379725201563759/971488439931392130

## Step 1: Configure Sui CLI

Initialize the Sui client and connect to testnet:

```bash
sui client
```

When prompted:
- Choose "y" to connect to a Sui Full node server
- Select "testnet" from the list of networks
- Choose "0" to generate a new keypair

## Step 2: Get Testnet Tokens

Get your wallet address:

```bash
sui client active-address
```

Request testnet tokens from the faucet:

```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "YOUR_WALLET_ADDRESS_HERE"
    }
}'
```

Or use the Discord faucet in the #testnet-faucet channel.

Verify you have tokens:

```bash
sui client gas
```

## Step 3: Build the Contracts

From the `contracts` directory:

```bash
cd contracts
sui move build
```

## Step 4: Deploy to Testnet

Deploy the contracts:

```bash
sui client publish --gas-budget 100000000
```

**IMPORTANT:** Save the output! You'll need:
- **Package ID**: The main package identifier
- **OperatorRegistry Object ID**: The shared object created by `operator_registry::init`

The output will look like:

```
╭──────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Object Changes                                                                                    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Created Objects:                                                                                  │
│  ┌──                                                                                              │
│  │ ObjectID: 0xABCD...  <- This is the OperatorRegistry Object ID                               │
│  │ Sender: 0x1234...                                                                             │
│  │ Owner: Shared                                                                                  │
│  │ ObjectType: 0xPACKAGE_ID::operator_registry::OperatorRegistry                                │
│  └──                                                                                              │
│ Published Objects:                                                                                │
│  ┌──                                                                                              │
│  │ PackageID: 0xPACKAGE_ID  <- This is the Package ID                                           │
│  │ Version: 1                                                                                     │
│  │ Digest: ...                                                                                    │
│  └──                                                                                              │
╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
```

## Step 5: Test the Deployment

Test creating a consignment:

```bash
sui client call \
  --package YOUR_PACKAGE_ID \
  --module consignment \
  --function create_consignment \
  --args \
    "24EU12345678901234567" \
    "0xRECIPIENT_ADDRESS" \
    "Wine" \
    1000 \
    "Liters" \
    "Bordeaux, France" \
    "Berlin, Germany" \
    1731499200000 \
  --gas-budget 10000000
```

## Step 6: Save Configuration

Create a `.env` file in the `backend` directory with the deployment info:

```env
# IOTA Testnet Configuration
IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
CONTRACT_PACKAGE_ID=YOUR_PACKAGE_ID_HERE
OPERATOR_REGISTRY_ID=YOUR_OPERATOR_REGISTRY_OBJECT_ID_HERE

# Server Configuration
PORT=3001
```

## Verification

Verify the deployment by viewing the package on the Sui Explorer:

```
https://suiscan.xyz/testnet/object/YOUR_PACKAGE_ID
```

## Troubleshooting

### "Insufficient gas"
Request more tokens from the faucet or increase the gas budget.

### "Package verification failed"
Make sure you're on the correct network (testnet) and the build completed successfully.

### "Object not found"
Wait a few seconds for the transaction to be processed, then try again.

## Next Steps

After successful deployment:
1. Update the backend `.env` file with the Package ID and Object IDs
2. Test the backend API endpoints
3. Update the frontend to connect to the deployed backend
