# 🔗 Smart Contracts Integration Guide

> Complete workflow showing how IOTA Move smart contracts power the EMCS application

## 📋 Table of Contents
- [Overview](#overview)
- [Deployed Contracts](#deployed-contracts)
- [Contract Usage by Feature](#contract-usage-by-feature)
- [Complete User Journeys](#complete-user-journeys)
- [Integration Points](#integration-points)
- [Code Examples](#code-examples)

---

## 🎯 Overview

The EMCS application uses **3 Move smart contracts** deployed on IOTA Testnet to provide immutable tracking, cryptographic verification, and role-based authorization for excise goods shipments.

### Contract Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      EMCS Application                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (React)          Backend (Node.js)                   │
│       │                          │                              │
│       │                          │                              │
│       └──────────┬───────────────┘                              │
│                  │                                              │
│                  ▼                                              │
│           @iota/iota-sdk                                        │
│                  │                                              │
└──────────────────┼──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                  IOTA Testnet Blockchain                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Package: 0x942fd017cb9ac11bb9d4efa537cae3cd47b7fcf2254a...   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  emcs::consignment_enhanced                          │     │
│  │  - create_consignment()                              │     │
│  │  - dispatch_consignment()                            │     │
│  │  - receive_consignment()                             │     │
│  │  - cancel_consignment()                              │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  emcs::operator_registry                             │     │
│  │  - add_operator()                                    │     │
│  │  - remove_operator()                                 │     │
│  │  - is_authorized()                                   │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  emcs::consignment (legacy)                          │     │
│  │  - Basic NFT operations                              │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Deployed Contracts

### 1. **emcs::consignment_enhanced** (Primary Contract)
**Purpose**: Main NFT-based consignment tracking with immutable notarization

**Deployed At**: `0x942fd017cb9ac11bb9d4efa537cae3cd47b7fcf2254a3f135455310fc52f4de6`

**Key Features**:
- ✅ NFT creation for each consignment
- ✅ Status lifecycle management (Draft → In Transit → Received)
- ✅ Document hash notarization (SHA256)
- ✅ Immutable `NotarizationRecord` objects
- ✅ Event emission for all state changes
- ✅ Role-based access control (consignor/consignee)

**Data Structures**:
```move
public struct Consignment has key, store {
    id: UID,
    arc: String,                    // Administrative Reference Code
    consignor: address,             // Sender wallet address
    consignee: address,             // Receiver wallet address
    goods_type: String,             // Wine, Beer, Spirits, Tobacco, Energy
    quantity: u64,
    unit: String,
    origin: String,
    destination: String,
    status: u8,                     // 0=Draft, 1=InTransit, 2=Received, 3=Cancelled
    document_hash: Option<vector<u8>>,  // SHA256 of e-AD
    created_at: u64,
    dispatched_at: Option<u64>,
    received_at: Option<u64>,
    metadata: Option<String>
}

public struct NotarizationRecord has key, store {
    id: UID,
    consignment_id: ID,
    document_hash: vector<u8>,      // SHA256 hash
    notarized_at: u64,
    notarizer: address,
    document_type: String           // "e-AD", "Receipt", etc.
}
```

---

### 2. **emcs::operator_registry**
**Purpose**: SEED operator authorization and admin management

**Deployed Object ID**: `0xd0e6ce2e96b968720b8591de18a11a1c23c7bf35b31b9f47c9d644ff7404caff`

**Key Features**:
- ✅ Centralized operator authorization
- ✅ Admin-only operator management
- ✅ Authorization checks for SEED system operations
- ✅ Shared object accessible to all

**Data Structures**:
```move
public struct OperatorRegistry has key {
    id: UID,
    admin: address,                 // Admin wallet address
    operators: VecMap<address, bool> // Authorized SEED operators
}
```

---

### 3. **emcs::consignment** (Legacy/Fallback)
**Purpose**: Basic NFT operations without enhanced features

**Use Case**: Backward compatibility, simple transfers

---

## 🔄 Contract Usage by Feature

### Feature 1: **Create Consignment** (Trader Creates Shipment)

**App Flow**:
1. User fills out consignment form on frontend
2. Frontend sends data to backend API
3. Backend calls smart contract

**Smart Contract Called**: `emcs::consignment_enhanced::create_consignment()`

**Parameters**:
```javascript
{
  arc: "24DE1234567890ABCDEF12",      // Auto-generated ARC
  consignee: "0x5d3b4d49f826...",    // Receiver's wallet address
  goods_type: "Wine",
  quantity: 500,
  unit: "Liters",
  origin: "Bordeaux, France",
  destination: "Berlin, Germany",
  metadata: "{\"producer\":\"Château Margaux\"}",
  clock: Clock_object,               // IOTA system clock
  ctx: TxContext
}
```

**On-Chain Result**:
- ✅ New `Consignment` NFT created (shared object)
- ✅ Status set to `STATUS_DRAFT` (0)
- ✅ `ConsignmentCreated` event emitted
- ✅ `MovementEvent` emitted
- ✅ NFT accessible to both consignor and consignee

**Backend Integration**:
```typescript
import { IotaClient, Transaction } from '@iota/iota-sdk';

const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::consignment_enhanced::create_consignment`,
  arguments: [
    tx.pure.string(arc),
    tx.pure.address(consigneeAddress),
    tx.pure.string(goodsType),
    tx.pure.u64(quantity),
    tx.pure.string(unit),
    tx.pure.string(origin),
    tx.pure.string(destination),
    tx.pure.string(metadata),
    tx.object('0x6'), // Clock object
  ],
});

const result = await client.signAndExecuteTransaction({
  signer: keypair,
  transaction: tx,
});
```

**What User Sees**:
- ✅ "Consignment created successfully!"
- ✅ Consignment appears in "My Consignments" list
- ✅ Status shows "Draft"
- ✅ QR code generated for tracking

---

### Feature 2: **Dispatch Consignment** (Trader Sends Goods)

**App Flow**:
1. User clicks "Dispatch" on a draft consignment
2. System generates SHA256 hash of e-AD document
3. Backend calls smart contract to notarize and update status

**Smart Contract Called**: `emcs::consignment_enhanced::dispatch_consignment()`

**Parameters**:
```javascript
{
  consignment: Consignment_object_id,  // Existing NFT
  document_hash: [0x3a, 0x5f, ...],   // SHA256 hash (32 bytes)
  document_type: "e-AD",
  clock: Clock_object,
  ctx: TxContext
}
```

**On-Chain Actions**:
1. **Authorization Check**: Verify sender is consignor
2. **Status Validation**: Must be Draft (0)
3. **Document Hash Storage**: Store SHA256 in NFT
4. **Status Update**: Change to `STATUS_IN_TRANSIT` (1)
5. **Create NotarizationRecord**: Immutable proof object (frozen)
6. **Emit Events**: `ConsignmentDispatched`, `DocumentNotarized`, `MovementEvent`

**On-Chain Result**:
- ✅ Consignment status → `IN_TRANSIT`
- ✅ `document_hash` field populated
- ✅ `dispatched_at` timestamp set
- ✅ Immutable `NotarizationRecord` created and frozen
- ✅ Events emitted for tracking

**Backend Integration**:
```typescript
// Generate SHA256 hash of e-AD document
const documentHash = crypto
  .createHash('sha256')
  .update(JSON.stringify(consignmentData))
  .digest();

const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::consignment_enhanced::dispatch_consignment`,
  arguments: [
    tx.object(consignmentId),
    tx.pure(Array.from(documentHash)), // 32-byte array
    tx.pure.string('e-AD'),
    tx.object('0x6'),
  ],
});

const result = await client.signAndExecuteTransaction({
  signer: consignorKeypair,
  transaction: tx,
});
```

**What User Sees**:
- ✅ Status changes from "Draft" to "In Transit"
- ✅ "Dispatched at: 2025-11-15 14:23:45"
- ✅ Document hash displayed: `0x3a5f...b2c1`
- ✅ Blockchain transaction link

---

### Feature 3: **Receive Consignment** (Receiver Confirms Delivery)

**App Flow**:
1. Consignee logs in and views incoming consignments
2. Clicks "Confirm Receipt"
3. Backend calls smart contract

**Smart Contract Called**: `emcs::consignment_enhanced::receive_consignment()`

**Parameters**:
```javascript
{
  consignment: Consignment_object_id,
  clock: Clock_object,
  ctx: TxContext
}
```

**On-Chain Actions**:
1. **Authorization Check**: Verify sender is consignee
2. **Status Validation**: Must be In Transit (1)
3. **Status Update**: Change to `STATUS_RECEIVED` (2)
4. **Timestamp**: Set `received_at`
5. **Emit Events**: `ConsignmentReceived`, `MovementEvent`

**On-Chain Result**:
- ✅ Consignment status → `RECEIVED`
- ✅ `received_at` timestamp set
- ✅ Events emitted
- ✅ Shipment lifecycle complete

**Backend Integration**:
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::consignment_enhanced::receive_consignment`,
  arguments: [
    tx.object(consignmentId),
    tx.object('0x6'),
  ],
});

const result = await client.signAndExecuteTransaction({
  signer: consigneeKeypair,
  transaction: tx,
});
```

**What User Sees**:
- ✅ Status changes to "Received"
- ✅ "Received at: 2025-11-15 16:45:12"
- ✅ Full timeline displayed (Created → Dispatched → Received)
- ✅ Compliance complete

---

### Feature 4: **Customs Officer Verification** (Green Zone Revenue Customs Login)

**App Flow**:
1. Customs officer logs into portal
2. Views list of consignments awaiting verification
3. Clicks "Verify on IOTA" button
4. System queries blockchain for NFT metadata

**Smart Contracts Used**:
- **Read-Only Queries** (no transactions):
  - `get_arc()`
  - `get_consignor()`
  - `get_consignee()`
  - `get_goods_type()`
  - `get_quantity()`
  - `get_status()`
  - `get_document_hash()`
  - `get_created_at()`
  - `get_dispatched_at()`
  - `get_received_at()`

**Backend Integration**:
```typescript
// Query consignment NFT from blockchain
const consignmentObject = await client.getObject({
  id: consignmentId,
  options: {
    showContent: true,
    showOwner: true,
  },
});

// Parse on-chain data
const onChainData = {
  arc: consignmentObject.content.fields.arc,
  consignor: consignmentObject.content.fields.consignor,
  consignee: consignmentObject.content.fields.consignee,
  goods_type: consignmentObject.content.fields.goods_type,
  quantity: consignmentObject.content.fields.quantity,
  status: consignmentObject.content.fields.status,
  document_hash: consignmentObject.content.fields.document_hash,
  created_at: consignmentObject.content.fields.created_at,
  dispatched_at: consignmentObject.content.fields.dispatched_at,
  received_at: consignmentObject.content.fields.received_at,
};

// Compare with EMCS database
const dbData = await database.getConsignment(arc);

// Verification checks
const verification = {
  arcMatch: onChainData.arc === dbData.arc,
  consignorMatch: onChainData.consignor === dbData.consignor,
  consigneeMatch: onChainData.consignee === dbData.consignee,
  goodsTypeMatch: onChainData.goods_type === dbData.goods_type,
  quantityMatch: onChainData.quantity === dbData.quantity,
  documentHashMatch: onChainData.document_hash === dbData.document_hash,
};

const allVerified = Object.values(verification).every(v => v === true);
```

**What Officer Sees**:

**IOTA Explorer Modal**:
```
┌─────────────────────────────────────────────────────────┐
│  🔍 IOTA Blockchain Verification                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  NFT Metadata (On-Chain):                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  📋 ARC: 24DE1234567890ABCDEF12                        │
│  👤 Consignor: 0x5d3b4d49f826...                       │
│  🎯 Consignee: 0x7f8c2a1b3d45...                       │
│  📦 Goods Type: Wine                                    │
│  ⚖️  Quantity: 500 Liters                              │
│  📄 Document Hash: 0x3a5fb2c1...                       │
│  📅 Created: 2025-11-15 12:00:00                       │
│  🚚 Dispatched: 2025-11-15 14:23:45                    │
│  ✅ Received: 2025-11-15 16:45:12                      │
│                                                         │
│  Verification Status:                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ✅ ARC matches EMCS database                          │
│  ✅ Consignor address verified                         │
│  ✅ Consignee address verified                         │
│  ✅ Goods type matches                                 │
│  ✅ Quantity matches                                   │
│  ✅ Document hash matches                              │
│                                                         │
│  [✅ Data Verified on IOTA]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Verification Result**:
- ✅ **GREEN CHECKMARK**: All data matches (no tampering)
- ❌ **RED WARNING**: Data mismatch detected (fraud alert)

---

### Feature 5: **SEED Operator Management** (Admin Authorization)

**App Flow**:
1. Admin logs into SEED management portal
2. Adds/removes authorized SEED operators
3. System verifies authorization before allowing actions

**Smart Contract Called**: `emcs::operator_registry::add_operator()`

**Parameters**:
```javascript
{
  registry: OperatorRegistry_shared_object_id,
  operator: "0x7f8c2a1b3d45...",  // New operator wallet
  ctx: TxContext
}
```

**On-Chain Actions**:
1. **Authorization Check**: Verify sender is admin
2. **Add to Registry**: Insert operator address into VecMap
3. **Return Success**

**Backend Integration**:
```typescript
const OPERATOR_REGISTRY_ID = '0xd0e6ce2e96b968720b8591de18a11a1c23c7bf35b31b9f47c9d644ff7404caff';

// Add operator
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::operator_registry::add_operator`,
  arguments: [
    tx.object(OPERATOR_REGISTRY_ID),
    tx.pure.address(operatorAddress),
  ],
});

await client.signAndExecuteTransaction({
  signer: adminKeypair,
  transaction: tx,
});

// Check if operator is authorized (read-only)
const isAuthorized = await client.devInspectTransactionBlock({
  sender: adminAddress,
  transactionBlock: tx.moveCall({
    target: `${PACKAGE_ID}::operator_registry::is_authorized`,
    arguments: [
      tx.object(OPERATOR_REGISTRY_ID),
      tx.pure.address(operatorAddress),
    ],
  }),
});
```

**What Admin Sees**:
- ✅ "Operator 0x7f8c... added successfully"
- ✅ List of all authorized operators
- ✅ Remove button for each operator

---

## 🎬 Complete User Journeys

### Journey 1: Wine Shipment from France to Germany

```
┌──────────────────────────────────────────────────────────────────┐
│  ACTOR: Wine Producer (Bordeaux, France)                         │
└──────────────────────────────────────────────────────────────────┘
    │
    ├─ 1. Create Consignment
    │     ├─ Frontend: Fill form (500L Wine, destination: Berlin)
    │     ├─ Backend: Generate ARC, call create_consignment()
    │     └─ Blockchain: NFT created (Draft status)
    │
    ├─ 2. Dispatch Consignment
    │     ├─ Frontend: Click "Dispatch"
    │     ├─ Backend: Hash e-AD document, call dispatch_consignment()
    │     └─ Blockchain: Status → In Transit, NotarizationRecord frozen
    │
┌──────────────────────────────────────────────────────────────────┐
│  ACTOR: Customs Officer (French Border)                          │
└──────────────────────────────────────────────────────────────────┘
    │
    ├─ 3. Verify Export
    │     ├─ Frontend: Login to customs portal
    │     ├─ Backend: Query blockchain for consignment NFT
    │     ├─ Blockchain: Read NFT fields (get_arc, get_document_hash, etc.)
    │     ├─ Backend: Compare with EMCS database
    │     └─ Frontend: Display verification ✅ (all fields match)
    │
┌──────────────────────────────────────────────────────────────────┐
│  ACTOR: Wine Importer (Berlin, Germany)                          │
└──────────────────────────────────────────────────────────────────┘
    │
    ├─ 4. Receive Consignment
    │     ├─ Frontend: View incoming shipment, click "Confirm Receipt"
    │     ├─ Backend: Call receive_consignment()
    │     └─ Blockchain: Status → Received, timestamp set
    │
┌──────────────────────────────────────────────────────────────────┐
│  ACTOR: German Customs Officer                                   │
└──────────────────────────────────────────────────────────────────┘
    │
    └─ 5. Final Verification
          ├─ Frontend: Login, select consignment
          ├─ Backend: Query blockchain for final state
          ├─ Blockchain: Read complete audit trail
          ├─ Backend: Verify all timestamps, hashes, addresses
          └─ Frontend: Display compliance report ✅
```

**Blockchain Records Created**:
1. `Consignment` NFT (shared object, mutable)
2. `NotarizationRecord` (frozen object, immutable)
3. 5 Events emitted:
   - `ConsignmentCreated`
   - `ConsignmentDispatched`
   - `DocumentNotarized`
   - `ConsignmentReceived`
   - Multiple `MovementEvent`s

---

### Journey 2: Customs Officer Detects Fraud

```
┌──────────────────────────────────────────────────────────────────┐
│  SCENARIO: Fraudster tries to alter quantity after dispatch      │
└──────────────────────────────────────────────────────────────────┘
    │
    ├─ 1. Fraudster edits EMCS database
    │     └─ Database: Quantity changed from 500L → 1000L
    │
    ├─ 2. Customs Officer Verification
    │     ├─ Frontend: Click "Verify on IOTA"
    │     ├─ Backend: Query blockchain + database
    │     ├─ Blockchain: Returns quantity = 500L (immutable)
    │     ├─ Database: Returns quantity = 1000L (tampered)
    │     └─ Backend: Comparison fails ❌
    │
    └─ 3. Fraud Alert
          ├─ Frontend: Red warning displayed
          ├─ System: Alert to authorities
          └─ Officer: Investigate shipment
```

**Why Blockchain Prevents This**:
- ✅ NFT data is **immutable** after dispatch
- ✅ `NotarizationRecord` is **frozen** (cannot be deleted)
- ✅ All events are **permanent**
- ✅ Officer can see **original values** on blockchain
- ✅ Tampered database is immediately detected

---

## 🔌 Integration Points

### Frontend → Blockchain (via Backend)

**Location**: `frontend/src/services/apiClient.ts`

```typescript
// Create consignment
export const createConsignment = async (data: ConsignmentData) => {
  const response = await axios.post('/api/consignments', data);
  return response.data; // Contains blockchain transaction hash
};

// Verify on blockchain
export const verifyConsignment = async (arc: string) => {
  const response = await axios.get(`/api/consignments/${arc}/verify`);
  return response.data; // Contains on-chain vs off-chain comparison
};
```

---

### Backend → Blockchain

**Location**: `backend/.env`

```bash
IOTA_RPC_URL=https://api.testnet.iota.cafe:443
CONTRACT_PACKAGE_ID=0x942fd017cb9ac11bb9d4efa537cae3cd47b7fcf2254a3f135455310fc52f4de6
OPERATOR_REGISTRY_ID=0xd0e6ce2e96b968720b8591de18a11a1c23c7bf35b31b9f47c9d644ff7404caff
CONSIGNMENT_MODULE=emcs::consignment_enhanced
```

**Location**: `backend/src/services/blockchainService.ts` (to be created)

```typescript
import { IotaClient, Transaction } from '@iota/iota-sdk';

const client = new IotaClient({ url: process.env.IOTA_RPC_URL });

export class BlockchainService {
  async createConsignment(data: ConsignmentData, signerKeypair: any) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${process.env.CONTRACT_PACKAGE_ID}::consignment_enhanced::create_consignment`,
      arguments: [
        tx.pure.string(data.arc),
        tx.pure.address(data.consignee),
        tx.pure.string(data.goods_type),
        tx.pure.u64(data.quantity),
        tx.pure.string(data.unit),
        tx.pure.string(data.origin),
        tx.pure.string(data.destination),
        tx.pure.string(JSON.stringify(data.metadata)),
        tx.object('0x6'), // Clock
      ],
    });

    const result = await client.signAndExecuteTransaction({
      signer: signerKeypair,
      transaction: tx,
    });

    return result.digest;
  }

  async verifyConsignment(consignmentId: string) {
    const object = await client.getObject({
      id: consignmentId,
      options: { showContent: true },
    });

    return {
      arc: object.content.fields.arc,
      consignor: object.content.fields.consignor,
      consignee: object.content.fields.consignee,
      goods_type: object.content.fields.goods_type,
      quantity: object.content.fields.quantity,
      status: object.content.fields.status,
      document_hash: object.content.fields.document_hash,
      created_at: object.content.fields.created_at,
      dispatched_at: object.content.fields.dispatched_at,
      received_at: object.content.fields.received_at,
    };
  }
}
```

---

## 📝 Code Examples

### Example 1: Dispatch with Document Notarization

```typescript
// backend/src/services/consignmentService.ts
import crypto from 'crypto';
import { BlockchainService } from './blockchainService';

export async function dispatchConsignment(arc: string, consignorKeypair: any) {
  // 1. Get consignment from database
  const consignment = await db.getConsignmentByArc(arc);
  
  // 2. Generate SHA256 hash of e-AD document
  const documentData = {
    arc: consignment.arc,
    consignor: consignment.consignor,
    consignee: consignment.consignee,
    goods_type: consignment.goods_type,
    quantity: consignment.quantity,
    created_at: consignment.created_at,
  };
  
  const documentHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(documentData))
    .digest();
  
  // 3. Call blockchain
  const blockchain = new BlockchainService();
  const txHash = await blockchain.dispatchConsignment(
    consignment.blockchain_id,
    documentHash,
    consignorKeypair
  );
  
  // 4. Update database
  await db.updateConsignment(arc, {
    status: 'IN_TRANSIT',
    document_hash: documentHash.toString('hex'),
    dispatched_at: new Date(),
    blockchain_tx: txHash,
  });
  
  return { success: true, transaction: txHash };
}
```

---

### Example 2: Customs Verification

```typescript
// backend/src/routes/customsRoutes.ts
router.get('/verify/:arc', async (req, res) => {
  const { arc } = req.params;
  
  // 1. Get data from database
  const dbData = await db.getConsignmentByArc(arc);
  
  // 2. Get data from blockchain
  const blockchain = new BlockchainService();
  const blockchainData = await blockchain.verifyConsignment(dbData.blockchain_id);
  
  // 3. Compare all fields
  const verification = {
    arc_match: blockchainData.arc === dbData.arc,
    consignor_match: blockchainData.consignor === dbData.consignor,
    consignee_match: blockchainData.consignee === dbData.consignee,
    goods_type_match: blockchainData.goods_type === dbData.goods_type,
    quantity_match: blockchainData.quantity.toString() === dbData.quantity.toString(),
    document_hash_match: blockchainData.document_hash === dbData.document_hash,
  };
  
  const allVerified = Object.values(verification).every(v => v === true);
  
  res.json({
    success: true,
    verified: allVerified,
    blockchain_data: blockchainData,
    database_data: dbData,
    verification_details: verification,
  });
});
```

---

## 🎯 Summary

### Contract Responsibilities

| Contract | Purpose | Used When |
|----------|---------|-----------|
| **consignment_enhanced** | Create, dispatch, receive, cancel consignments | Every shipment operation |
| **operator_registry** | Manage SEED operator authorization | Admin operations, role checks |
| **consignment** (legacy) | Basic NFT operations | Backward compatibility |

### Key Benefits

1. **Immutability**: Once dispatched, data cannot be altered (fraud prevention)
2. **Transparency**: All stakeholders see the same blockchain data
3. **Auditability**: Complete audit trail with timestamps and events
4. **Authorization**: Role-based access (consignor/consignee/admin)
5. **Notarization**: Cryptographic proof of document existence
6. **Compliance**: EU EMCS standards with blockchain enhancement

### Next Steps

1. ✅ Contracts deployed on IOTA Testnet
2. 🔄 **Next**: Integrate frontend with real blockchain calls (replace mock)
3. 🔄 **Next**: Create `BlockchainService` in backend
4. 🔄 **Next**: Test full workflow with real transactions
5. 🔄 **Next**: Deploy frontend + backend to production

---

**Questions?** Check the [README.md](README.md) or explore the [contract source code](contracts/sources/).
