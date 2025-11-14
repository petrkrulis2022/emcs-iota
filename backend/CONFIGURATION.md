# Backend Configuration Guide

## Overview

The backend requires configuration with deployed IOTA smart contract addresses before it can interact with the blockchain.

## Prerequisites

Before configuring the backend, you must:
1. ✅ Deploy Move contracts to IOTA Testnet (Task 10.1)
2. ✅ Have Package ID and Operator Registry ID from deployment

## Configuration Steps

### Step 1: Create .env File

Copy the example environment file:

```bash
cd backend
cp .env.example .env
```

### Step 2: Update Contract Addresses

Edit `backend/.env` and add your deployed contract addresses:

```env
# Server Configuration
PORT=3000

# IOTA Configuration
IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
CONTRACT_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
OPERATOR_REGISTRY_ID=0xYOUR_REGISTRY_ID_HERE

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Where to find these values:**
- After deploying contracts (Task 10.1), these values are in:
  - `contracts/deploy_output.json`
  - Or extracted by running: `node contracts/extract-deployment-info.js contracts/deploy_output.json`

### Step 3: Verify Configuration

Check that all required environment variables are set:

```bash
# On Linux/Mac
cat .env

# On Windows
type .env
```

Required variables:
- ✅ `PORT` - Server port (default: 3000)
- ✅ `IOTA_RPC_URL` - IOTA Testnet RPC endpoint
- ✅ `CONTRACT_PACKAGE_ID` - Deployed package ID
- ✅ `OPERATOR_REGISTRY_ID` - Operator registry object ID
- ✅ `FRONTEND_URL` - Frontend origin for CORS

## Testing Configuration

### Test 1: Start Backend Server

```bash
npm run dev
```

Expected output:
```
🚀 EMCS Backend API running on port 3000
📝 Environment: development
🌐 CORS enabled for: http://localhost:5173
🔗 IOTA RPC: https://fullnode.testnet.sui.io:443
```

### Test 2: Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T...",
  "service": "emcs-backend"
}
```

### Test 3: API Info

```bash
curl http://localhost:3000/api
```

Expected response:
```json
{
  "message": "EMCS Blockchain Demo API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```


### Test 4: Test Blockchain Integration (After Deployment)

Once contracts are deployed and configured, test the API endpoints:

#### Create Consignment
```bash
curl -X POST http://localhost:3000/api/consignments \
  -H "Content-Type: application/json" \
  -d '{
    "consignor": "0xYOUR_WALLET_ADDRESS",
    "consignee": "0xRECIPIENT_ADDRESS",
    "goodsType": "Wine",
    "quantity": 1000,
    "unit": "Liters",
    "origin": "Bordeaux, France",
    "destination": "Berlin, Germany"
  }'
```

Expected response:
```json
{
  "success": true,
  "arc": "24EU12345678901234567",
  "transactionId": "0x...",
  "consignmentId": "0x..."
}
```

#### List Consignments
```bash
curl "http://localhost:3000/api/consignments?operator=0xYOUR_WALLET_ADDRESS"
```

#### Get Consignment by ARC
```bash
curl "http://localhost:3000/api/consignments/24EU12345678901234567"
```

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | Yes |
| `IOTA_RPC_URL` | IOTA Testnet RPC endpoint | `https://fullnode.testnet.sui.io:443` | Yes |
| `CONTRACT_PACKAGE_ID` | Deployed package ID | `0xabcd1234...` | Yes |
| `OPERATOR_REGISTRY_ID` | Operator registry object ID | `0xef567890...` | Yes |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` | Yes |

## Troubleshooting

### "CONTRACT_PACKAGE_ID not set"
**Problem**: Backend starts but warns about missing contract address.

**Solution**: 
1. Deploy contracts first (Task 10.1)
2. Update `.env` with Package ID
3. Restart backend

### "Failed to connect to IOTA network"
**Problem**: Cannot connect to IOTA RPC endpoint.

**Solution**:
1. Check `IOTA_RPC_URL` is correct
2. Verify network connectivity
3. Try alternative RPC: `https://fullnode.testnet.sui.io:443`

### "CORS error" from frontend
**Problem**: Frontend cannot call backend API.

**Solution**:
1. Check `FRONTEND_URL` matches frontend origin
2. Restart backend after changing `.env`
3. Verify frontend is running on correct port

### "Transaction failed"
**Problem**: API calls fail with blockchain errors.

**Solution**:
1. Verify `CONTRACT_PACKAGE_ID` is correct
2. Check contract is deployed: `https://suiscan.xyz/testnet/object/PACKAGE_ID`
3. Ensure wallet has testnet tokens
4. Check IOTA network status

## Production Configuration

For production deployment, update:

```env
# Production settings
PORT=3000
NODE_ENV=production

# Use production RPC endpoint
IOTA_RPC_URL=https://fullnode.mainnet.sui.io:443

# Update with mainnet contract addresses
CONTRACT_PACKAGE_ID=0xYOUR_MAINNET_PACKAGE_ID
OPERATOR_REGISTRY_ID=0xYOUR_MAINNET_REGISTRY_ID

# Update with production frontend URL
FRONTEND_URL=https://your-frontend-domain.com
```

**Important**: Never commit `.env` file to version control!

## Next Steps

After configuration:
1. ✅ Backend configured with contract addresses
2. ⏭️ Test all API endpoints
3. ⏭️ Deploy backend to cloud platform (Task 10.3)
4. ⏭️ Configure and deploy frontend (Task 10.4)

## Additional Resources

- IOTA Documentation: https://docs.sui.io
- Testnet Explorer: https://suiscan.xyz/testnet
- Contract Deployment Guide: `../contracts/DEPLOYMENT_INSTRUCTIONS.md`
