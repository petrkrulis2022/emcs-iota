# Demo Setup Guide

## Overview

This guide helps you create demo wallets and test data for the EMCS Blockchain Demo presentation.

## Prerequisites

- ✅ Contracts deployed to IOTA Testnet (Task 10.1)
- ✅ Backend deployed (Task 10.3)
- ✅ Frontend deployed (Task 10.4)
- ✅ Sui CLI installed and configured

## Demo Scenario

We'll create a realistic demo showing:
1. **Consignor** (French wine producer) creates consignment
2. **Consignor** dispatches shipment with e-AD document
3. **Consignee** (German distributor) receives shipment
4. View complete movement history on blockchain

## Step 1: Create Demo Wallets

### Wallet 1: Consignor (Wine Producer)

```bash
# Create new wallet
sui client new-address ed25519 consignor

# Get address
sui client active-address

# Save this address as CONSIGNOR_ADDRESS
```

### Wallet 2: Consignee (Distributor)

```bash
# Create new wallet
sui client new-address ed25519 consignee

# Get address
sui client active-address

# Save this address as CONSIGNEE_ADDRESS
```

### Wallet 3: Observer (Optional - for demo variety)

```bash
# Create new wallet
sui client new-address ed25519 observer

# Get address
sui client active-address

# Save this address as OBSERVER_ADDRESS
```

## Step 2: Fund Wallets with Testnet Tokens

### Get Testnet Tokens

For each wallet address, request tokens from the faucet:

```bash
# Method 1: Using curl
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "YOUR_WALLET_ADDRESS_HERE"
    }
}'

# Method 2: Discord faucet
# Join Sui Discord and request in #testnet-faucet channel
# https://discord.com/channels/916379725201563759/971488439931392130
```

### Verify Balances

```bash
# Switch to consignor wallet
sui client switch --address CONSIGNOR_ADDRESS
sui client gas

# Switch to consignee wallet
sui client switch --address CONSIGNEE_ADDRESS
sui client gas
```

Each wallet should have at least 1 SUI (1,000,000,000 MIST).

## Step 3: Save Wallet Information

Create a file `demo-wallets.txt` with wallet details:

```
DEMO WALLETS
============

Consignor (French Wine Producer):
Address: 0x...
Role: Creates and dispatches consignments
Recovery Phrase: [KEEP SECURE]

Consignee (German Distributor):
Address: 0x...
Role: Receives consignments
Recovery Phrase: [KEEP SECURE]

Observer (Optional):
Address: 0x...
Role: View-only for demo variety
Recovery Phrase: [KEEP SECURE]
```

**Important**: Keep recovery phrases secure and never commit to version control!


## Step 4: Create Test Consignments

### Consignment 1: Wine Shipment (Draft Status)

```bash
# Switch to consignor wallet
sui client switch --address CONSIGNOR_ADDRESS

# Create consignment via API
curl -X POST https://your-backend-url.com/api/consignments \
  -H "Content-Type: application/json" \
  -d '{
    "consignor": "CONSIGNOR_ADDRESS",
    "consignee": "CONSIGNEE_ADDRESS",
    "goodsType": "Wine",
    "quantity": 5000,
    "unit": "Liters",
    "origin": "Bordeaux, France",
    "destination": "Berlin, Germany"
  }'

# Save the returned ARC
```

### Consignment 2: Beer Shipment (In Transit Status)

```bash
# Create consignment
curl -X POST https://your-backend-url.com/api/consignments \
  -H "Content-Type: application/json" \
  -d '{
    "consignor": "CONSIGNOR_ADDRESS",
    "consignee": "CONSIGNEE_ADDRESS",
    "goodsType": "Beer",
    "quantity": 10000,
    "unit": "Liters",
    "origin": "Munich, Germany",
    "destination": "Paris, France"
  }'

# Dispatch it immediately
curl -X POST https://your-backend-url.com/api/consignments/ARC_HERE/dispatch \
  -H "Content-Type: application/json" \
  -d '{
    "consignor": "CONSIGNOR_ADDRESS"
  }'
```

### Consignment 3: Spirits Shipment (Received Status)

```bash
# Create consignment
curl -X POST https://your-backend-url.com/api/consignments \
  -H "Content-Type: application/json" \
  -d '{
    "consignor": "CONSIGNOR_ADDRESS",
    "consignee": "CONSIGNEE_ADDRESS",
    "goodsType": "Spirits",
    "quantity": 2000,
    "unit": "Liters",
    "origin": "Edinburgh, Scotland",
    "destination": "Amsterdam, Netherlands"
  }'

# Dispatch it
curl -X POST https://your-backend-url.com/api/consignments/ARC_HERE/dispatch \
  -H "Content-Type: application/json" \
  -d '{
    "consignor": "CONSIGNOR_ADDRESS"
  }'

# Receive it
curl -X POST https://your-backend-url.com/api/consignments/ARC_HERE/receive \
  -H "Content-Type: application/json" \
  -d '{
    "consignee": "CONSIGNEE_ADDRESS"
  }'
```

## Step 5: Verify Test Data

### Check Dashboard

1. Open frontend: `https://your-frontend-url.com`
2. Connect consignor wallet
3. Verify 3 consignments appear on dashboard
4. Check different statuses: Draft, In Transit, Received

### Check Individual Consignments

For each ARC:
```bash
curl https://your-backend-url.com/api/consignments/ARC_HERE
```

### Check Movement History

```bash
curl https://your-backend-url.com/api/consignments/ARC_HERE/events
```

## Step 6: Take Screenshots

Capture screenshots for documentation:

1. **Dashboard View**
   - All consignments listed
   - Different status badges visible
   - Filters working

2. **Consignment Details**
   - All fields displayed
   - QR code visible
   - Movement timeline

3. **Wallet Connection**
   - Connected wallet address
   - Disconnect button

4. **Create Consignment Form**
   - All input fields
   - Validation working

5. **Movement Timeline**
   - All events listed
   - Timestamps visible
   - Transaction IDs clickable

## Step 7: Prepare Demo Script

Create a file `demo-script.md` with step-by-step demo flow:

```markdown
# Demo Script

## Introduction (30 seconds)
- Show problem: €8-12B annual EU tax evasion
- Current EMCS: 2-day delays, paper-based
- Solution: Real-time blockchain tracking

## Demo Flow (5 minutes)

### 1. Dashboard Overview (30 seconds)
- Show existing consignments
- Point out different statuses
- Explain color coding

### 2. Create Consignment (1 minute)
- Click "Create Consignment"
- Fill in details:
  - Consignee: [Address]
  - Goods: Wine
  - Quantity: 1000 Liters
  - Origin: Bordeaux, France
  - Destination: Berlin, Germany
- Submit and show ARC generated

### 3. View Consignment Details (1 minute)
- Click on newly created consignment
- Show QR code
- Explain ARC format
- Show all shipment details

### 4. Dispatch Consignment (1 minute)
- Click "Dispatch" button
- Explain e-AD document hashing
- Show status change to "In Transit"
- Show updated movement timeline

### 5. Receive Consignment (1 minute)
- Switch to consignee wallet
- Find consignment in dashboard
- Click "Confirm Receipt"
- Show status change to "Received"
- Show complete movement history

### 6. Blockchain Benefits (30 seconds)
- Immutable audit trail
- Real-time tracking
- No single point of failure
- Feeless transactions on IOTA
- Future: IoT integration, automated customs

## Q&A (2 minutes)
```

## Step 8: Test Complete Flow

Run through the entire demo flow:

1. [ ] Connect consignor wallet
2. [ ] View dashboard with existing consignments
3. [ ] Create new consignment
4. [ ] View consignment details and QR code
5. [ ] Dispatch consignment
6. [ ] Disconnect and connect consignee wallet
7. [ ] Find consignment in dashboard
8. [ ] Confirm receipt
9. [ ] View complete movement history
10. [ ] Check blockchain explorer for transactions

## Demo Checklist

### Pre-Demo Setup
- [ ] 2-3 wallets created and funded
- [ ] 2-3 test consignments created
- [ ] Different statuses represented (Draft, In Transit, Received)
- [ ] Screenshots taken
- [ ] Demo script prepared
- [ ] Complete flow tested

### Technical Checks
- [ ] Backend running and accessible
- [ ] Frontend running and accessible
- [ ] Wallet extension installed
- [ ] Wallets on testnet
- [ ] All wallets have sufficient gas
- [ ] No console errors
- [ ] No CORS errors

### Backup Plan
- [ ] Screenshots saved
- [ ] Video recording prepared (optional)
- [ ] Wallet addresses documented
- [ ] ARCs documented
- [ ] Transaction IDs saved

## Troubleshooting

### "Insufficient gas"
- Request more tokens from faucet
- Each wallet needs at least 0.5 SUI

### "Transaction failed"
- Check wallet is on testnet
- Verify contract addresses in backend .env
- Check IOTA network status

### "Wallet not connecting"
- Ensure wallet extension installed
- Check wallet is on testnet network
- Try different browser

### "CORS error"
- Verify backend FRONTEND_URL matches frontend URL
- Redeploy backend if needed

## Demo Tips

1. **Practice**: Run through demo 2-3 times before presentation
2. **Timing**: Keep demo under 6 minutes
3. **Backup**: Have screenshots ready if live demo fails
4. **Explain**: Narrate what you're doing as you demo
5. **Highlight**: Emphasize blockchain benefits
6. **Prepare**: Have answers ready for common questions

## Common Demo Questions

**Q: Why blockchain instead of traditional database?**
A: Immutable audit trail, no single point of failure, transparent for all parties, enables future tokenization.

**Q: Why IOTA specifically?**
A: Feeless transactions, object-based model perfect for NFTs, Move language for safe smart contracts.

**Q: How does this prevent fraud?**
A: Immutable records, cryptographic hashing of documents, real-time tracking, transparent audit trail.

**Q: What about scalability?**
A: IOTA handles thousands of TPS, can scale to millions of consignments, parallel transaction processing.

**Q: Integration with existing EMCS?**
A: API gateway can bridge to current systems, gradual migration possible, maintains compatibility.

## Next Steps

After demo setup:
1. ✅ Demo wallets created and funded
2. ✅ Test consignments created
3. ✅ Complete flow tested
4. ⏭️ Write documentation (Task 10.6)
5. ⏭️ Prepare presentation
6. ⏭️ Practice demo

## Additional Resources

- Sui Wallet Guide: https://docs.sui.io/guides/developer/getting-started/get-address
- Testnet Faucet: https://faucet.testnet.sui.io/gas
- Sui Explorer: https://suiscan.xyz/testnet
- Demo Best Practices: https://www.youtube.com/watch?v=demo-tips
