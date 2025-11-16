# EMCS Blockchain Demo

> A decentralized excise goods tracking system built on IOTA blockchain for the Moveathon Europe hackathon.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![IOTA](https://img.shields.io/badge/IOTA-Testnet-blue)](https://suiscan.xyz/testnet)
[![Move](https://img.shields.io/badge/Move-Smart%20Contracts-green)](https://docs.sui.io/concepts/sui-move-concepts)

## 🎯 Overview

The EMCS Blockchain Demo digitizes the EU's Electronic Movement and Control System (EMCS) framework, enabling traders to create, track, and verify excise goods shipments with immutable blockchain records.

**Problem**: €8-12B lost annually to EU excise tax evasion, 2-day tracking delays, paper-based processes prone to fraud.

**Solution**: Real-time blockchain tracking with immutable audit trails, cryptographic document verification, and transparent multi-party workflows.

## 🚀 Live Demo

- **Frontend**: [https://691a197355dea100089c0d03--emcs-on-ota-smart-contracts.netlify.app](https://691a197355dea100089c0d03--emcs-on-ota-smart-contracts.netlify.app) (Netlify)
- **Backend API**: [https://emcs-iota-production.up.railway.app](https://emcs-iota-production.up.railway.app) (Railway)
- **Smart Contracts**: Deployed on IOTA Testnet
  - **Package ID**: `0x942fd017cb9ac11bb9d4efa537cae3cd47b7fcf2254a3f135455310fc52f4de6`
  - **Operator Registry**: `0xd0e6ce2e96b968720b8591de18a11a1c23c7bf35b31b9f47c9d644ff7404caff`
  - **Transaction**: [View on Explorer](https://explorer.iota.cafe/txblock/3BEWkH5GTNP5WeidbanBQxy5DYs7go4H2TvgXNnUcuzf?network=testnet)
  - **Network**: IOTA Testnet
  - 📖 **[Smart Contracts Integration Guide](SMART_CONTRACTS_INTEGRATION_GUIDE.md)** - Complete guide on how contracts are used in the app

### 🎥 Demo Resources
- **Landing Page**: Interactive landing page with comprehensive EMCS and IOTA information
- **Video Screenplay**: Complete 3-4 minute demo script available in [VIDEO_SCREENPLAY.md](VIDEO_SCREENPLAY.md)
- **Demo Script**: Step-by-step demo instructions in [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

## ✨ Key Features

- 🔐 **Blockchain Authentication** - Wallet-based secure authentication
- 🆔 **Decentralized Identity** - IOTA Identity integration for operator verification
- 📦 **Consignment Management** - Create and track excise goods shipments as NFTs
- 🔄 **Status Tracking** - Real-time updates (Draft → In Transit → Received)
- 📱 **QR Code Generation** - Scannable codes for quick access
- 🔗 **Immutable Audit Trail** - All movements permanently recorded on IOTA
- 📄 **Document Notarization** - SHA256 hashing with blockchain anchoring
- 🎯 **ARC Generation** - Unique Administrative Reference Codes (EU standard)
- 🌍 **Multi-Party Workflow** - Consignor and consignee authorization
- ⚡ **Feeless Transactions** - IOTA's unique architecture eliminates gas fees
- 🔍 **Transparent Verification** - Anyone can verify movements on blockchain
- 🏠 **Landing Page** - Comprehensive information page with "Launch App" button
- 🎬 **Demo Ready** - Complete video screenplay and demo script included

## 📊 Architecture

This is a monorepo containing three main components:

- **frontend/** - React + Vite + TypeScript web application (deployed on Netlify)
- **backend/** - Node.js + Express API server (deployed on Railway)
- **contracts/** - IOTA Move smart contracts (deployed on IOTA Testnet)

```
┌─────────────────────────────────────────────────────────────┐
│               Frontend (React + Vite) - Netlify              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Landing Page  │  │  Dashboard   │  │ Consignment  │      │
│  │  Component   │  │   Component  │  │     Form     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTPS/REST
┌────────────────────────────▼──────────────────────────────────┐
│            Backend API (Node.js + Express) - Railway          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Consignment  │  │  Identity    │  │     ARC      │       │
│  │   Routes     │  │   Service    │  │  Generator   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────────┬───────────────────────────────────┘
                             │ IOTA SDK
┌────────────────────────────▼───────────────────────────────────┐
│              IOTA Blockchain (Testnet) - Deployed              │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              Move Smart Contracts                     │     │
│  │  ┌──────────────────┐ ┌──────────────────┐          │     │
│  │  │ Consignment      │ │ Operator         │          │     │
│  │  │ Module           │ │ Registry Module  │          │     │
│  │  └──────────────────┘ └──────────────────┘          │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React** 18.3+ - UI framework
- **TypeScript** 5.9 - Type safety
- **Vite** 7.2 - Build tool
- **IOTA Wallet SDK** - Blockchain authentication
- **IOTA Identity SDK** (@iota/identity-wasm) - Decentralized identity and credentials
- **TailwindCSS** 4.x - Styling
- **React Router** 6.x - Navigation
- **Zustand** - State management
- **QRCode.react** - QR code generation
- **Axios** - HTTP client

### Backend
- **Node.js** 20+ - Runtime
- **Express** 4.x - Web framework
- **TypeScript** 5.9 - Type safety
- **IOTA SDK** (@iota/sdk) - Blockchain integration
- **IOTA Identity SDK** (@iota/identity-wasm) - DID and verifiable credentials
- **Crypto** (built-in) - SHA256 hashing
- **CORS** - Cross-origin support
- **dotenv** - Environment configuration

### Blockchain
- **IOTA Testnet** - Blockchain network
- **Move** - Smart contract language
- **Sui Framework** - Move framework
- **NFT-based** - Consignment representation

## 📦 Smart Contracts - Deployed on IOTA Testnet

**Network**: IOTA Testnet  
**Package ID**: `0x942fd017cb9ac11bb9d4efa537cae3cd47b7fcf2254a3f135455310fc52f4de6`  
**Deployment Transaction**: [3BEWkH5GTNP5WeidbanBQxy5DYs7go4H2TvgXNnUcuzf](https://explorer.iota.cafe/txblock/3BEWkH5GTNP5WeidbanBQxy5DYs7go4H2TvgXNnUcuzf?network=testnet)  
**Deployed**: November 15, 2025

### Deployed Contracts

| Contract | Description | Address |
|----------|-------------|---------|
| **consignment.move** | Main consignment tracking with beer excise duty | `0x942fd017cb9ac11bb9d4efa537cae3cd47b7fcf2254a3f135455310fc52f4de6::consignment` |
| **consignment_enhanced.move** | Enhanced version with cancellation & immutable notarization | `0x942fd017cb9ac11bb9d4efa537cae3cd47b7fcf2254a3f135455310fc52f4de6::consignment_enhanced` |
| **operator_registry.move** | SEED operator authorization registry | `0x942fd017cb9ac11bb9d4efa537cae3cd47b7fcf2254a3f135455310fc52f4de6::operator_registry` |

**Registry Object ID**: `0xd0e6ce2e96b968720b8591de18a11a1c23c7bf35b31b9f47c9d644ff7404caff`

### Contract Features Summary

The project uses IOTA's Move language to implement excise goods tracking with NFT-based consignments.

### 1. **consignment.move** (Main Production Contract) ⭐

**Purpose**: Core consignment tracking for EU excise goods movement

**Key Features**:
- ✅ **NFT-Based Consignments** - Each shipment is a unique blockchain NFT
- ✅ **Beer Excise Duty Calculation** - Automatic Irish excise duty calculation
- ✅ **Multi-Transport Modes** - Support for Road, Rail, Sea (comma-separated)
- ✅ **Status Workflow** - Draft → In Transit → Received
- ✅ **Document Notarization** - SHA256 hash storage for e-AD documents
- ✅ **Timestamping** - Uses IOTA Clock for accurate timestamps

**Consignment NFT Structure**:
```move
public struct Consignment has key, store {
    id: UID,                          // Unique object ID
    arc: String,                      // EU Administrative Reference Code
    consignor: address,               // Sender wallet address
    consignee: address,               // Receiver wallet address
    goods_type: String,               // Wine, Beer, Spirits, Tobacco, Energy
    quantity: u64,                    // Amount in liters/kg
    unit: String,                     // Measurement unit
    origin: String,                   // Origin location
    destination: String,              // Destination location
    transport_modes: vector<String>,  // Multiple transport modes
    beer_name: Option<String>,        // Beer product name (optional)
    alcohol_percentage: Option<u64>,  // ABV × 10 (e.g., 44 = 4.4%)
    excise_duty_cents: Option<u64>,   // Irish duty in euro cents
    status: u8,                       // 0=Draft, 1=InTransit, 2=Received
    document_hash: Option<vector<u8>>, // SHA256 hash of e-AD
    created_at: u64,                  // Creation timestamp
    dispatched_at: Option<u64>,       // Dispatch timestamp
    received_at: Option<u64>,         // Receipt timestamp
}
```

**Core Functions**:
1. **`create_consignment()`** - Creates new consignment NFT (Draft status)
   - Generates unique on-chain object
   - Parses transport modes from comma-separated string
   - Calculates Irish beer excise duty automatically
   - Emits `ConsignmentCreated` event
   
2. **`dispatch_consignment()`** - Moves to In Transit
   - Only consignor authorized
   - Requires document hash for notarization
   - Updates status and timestamps
   - Emits `ConsignmentDispatched` event
   
3. **`receive_consignment()`** - Moves to Received
   - Only consignee authorized
   - Completes movement cycle
   - Emits `ConsignmentReceived` event

4. **`calculate_irish_beer_duty()`** - Irish excise duty calculation
   - **Low ABV (≤2.8%)**: €11.27 per hectolitre
   - **Standard ABV (>2.8%)**: €22.55 per hectolitre
   - Formula: `(Rate × hectolitres × ABV) / 10`
   - Returns duty in euro cents for precision

**Events Emitted**:
- `ConsignmentCreated` - When consignment created
- `ConsignmentDispatched` - When dispatched with document hash
- `ConsignmentReceived` - When received by consignee
- `MovementEvent` - Generic event for backward compatibility

**Authorization Model**:
- ✅ Anyone can create consignment
- ✅ Only consignor can dispatch
- ✅ Only consignee can receive

---

### 2. **operator_registry.move** (Access Control)

**Purpose**: Manages authorized SEED operators for EMCS compliance

**Key Features**:
- Admin-controlled registry
- Add/remove operator addresses
- Authorization checking for consignment creation

**Registry Structure**:
```move
public struct OperatorRegistry has key {
    id: UID,
    admin: address,                   // Registry administrator
    operators: VecMap<address, bool>, // Authorized operators
}
```

**Functions**:
1. **`init()`** - Initializes registry (deployer becomes admin)
2. **`add_operator()`** - Admin adds authorized operator
3. **`remove_operator()`** - Admin removes operator
4. **`is_authorized()`** - Check if address is authorized
5. **`get_admin()`** - Get admin address

**Use Cases**:
- Whitelist legitimate SEED operators
- Restrict consignment creation to registered entities
- EU compliance for excise goods tracking
- Enterprise access control

---

### 3. **consignment_enhanced.move** (Advanced Features)

**Purpose**: Enhanced version with cancellation and immutable notarization

**Additional Features**:
- ✅ **Cancellation Support** - Draft consignments can be cancelled
- ✅ **Immutable Notarization Records** - Frozen NFT objects for legal proof
- ✅ **Metadata Field** - Extensible JSON metadata
- ✅ **Display NFT** - NFT display metadata for wallets/explorers
- ✅ **4 Status States** - Draft, In Transit, Received, Cancelled

**Notarization Record Structure**:
```move
public struct NotarizationRecord has key, store {
    id: UID,
    consignment_id: ID,         // Reference to consignment
    document_hash: vector<u8>,  // SHA256 hash
    notarized_at: u64,          // Timestamp
    notarizer: address,         // Who notarized
    document_type: String,      // "e-AD", "Receipt", etc.
}
```

**Enhanced Functions**:
1. **`cancel_consignment()`** - Cancel draft consignment
   - Only consignor authorized
   - Requires cancellation reason
   - Emits `ConsignmentCancelled` event

2. **`dispatch_consignment()`** - Enhanced version
   - Creates frozen `NotarizationRecord` NFT
   - Permanent immutable proof
   - Dual event emission

3. **`verify_document_hash()`** - Cryptographic verification

**Additional Events**:
- `ConsignmentCancelled` - When cancelled with reason
- `DocumentNotarized` - When document permanently notarized

---

### NFT & Consignment Relationship

#### **How Consignments Work as NFTs**

**IOTA/Sui uses an object-based model**, not traditional storage:

1. **Each Consignment = 1 Unique NFT Object**
   - When `create_consignment()` is called, a new on-chain object is created
   - Object has unique ID (e.g., `0xabc123...`)
   - Stored permanently on IOTA blockchain
   - **Shared object** accessible by both consignor and consignee

2. **No Central Registry**
   - Consignments are NOT stored in a mapping or array
   - Each is an independent blockchain object
   - Objects are "owned" or "shared" between parties

3. **NFT Abilities**
   ```move
   public struct Consignment has key, store {
       // key = can be owned as an object
       // store = can be stored in other objects
   }
   ```

4. **Object Lifecycle**:
   ```
   Create → Shared Object (accessible by consignor & consignee)
          ↓
   Dispatch → Status update (object mutated)
          ↓
   Receive → Final state (object remains on-chain forever)
   ```

#### **Querying Consignments**

To retrieve consignments from blockchain:

**Method 1: By Object ID**
```typescript
// Direct lookup if you know the object ID
const consignment = await client.getObject({
    id: '0xabc123...',
    options: { showContent: true }
});
```

**Method 2: By Owner Address**
```typescript
// Find all consignments for an operator
const objects = await client.getOwnedObjects({
    owner: operatorAddress,
    filter: { 
        StructType: "emcs::consignment::Consignment" 
    }
});
```

**Method 3: By Events**
```typescript
// Query ConsignmentCreated events to find ARCs
const events = await client.queryEvents({
    query: { 
        MoveEventType: "emcs::consignment::ConsignmentCreated" 
    }
});
```

#### **Example: Creating a Beer Consignment**

```move
// Smart contract call
create_consignment(
    b"24CZ1234567890123456A",  // ARC
    0x7db0...,                  // Consignee (Tesco Ireland)
    b"Beer",                    // Goods type
    5000,                       // 5000 liters
    b"Liters",                  // Unit
    b"Plzeň, Czech Republic",   // Origin
    b"Dublin, Ireland",         // Destination
    b"Road,Rail,Sea",           // Transport modes
    b"Pilsner Urquell",         // Beer name
    44,                         // 4.4% ABV (× 10)
    clock,
    ctx
)
```

**What happens on-chain**:
1. ✅ Creates unique `Consignment` NFT object
2. ✅ Calculates excise duty: €4,961.00 (stored as 496100 cents)
3. ✅ Shares object between consignor & consignee
4. ✅ Emits `ConsignmentCreated` event
5. ✅ Returns object ID for tracking

**Result**:
- Object ID: `0xdef456...` (unique blockchain identifier)
- ARC: `24CZ1234567890123456A` (human-readable reference)
- Status: Draft (0)
- Excise Duty: €4,961.00 (automatically calculated)
- Accessible by both Pilsner Urquell and Tesco Ireland wallets

---

### Smart Contracts Comparison

| Feature | consignment.move | operator_registry.move | consignment_enhanced.move |
|---------|-----------------|----------------------|--------------------------|
| **Beer Excise Duty** | ✅ Yes | ❌ No | ❌ No |
| **Multi-Transport** | ✅ Yes | ❌ No | ❌ No |
| **Cancellation** | ❌ No | ❌ No | ✅ Yes |
| **Notarization Records** | Basic | ❌ No | ✅ Immutable NFTs |
| **Operator Registry** | ❌ No | ✅ Yes | ❌ No |
| **Metadata** | Limited | ❌ No | ✅ Extensible |
| **Status States** | 3 | N/A | 4 |
| **Production Ready** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Current Integration** | ✅ Active | ⚠️ Optional | ⚠️ Alternative |

**Recommended for Demo**: `consignment.move` (includes all beer excise duty features)

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **npm** or yarn
- **IOTA Wallet** browser extension
- **Sui CLI** (for Move contract deployment)
- **Git** for cloning repository

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EMCS-IOTA
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install

# Or install individually
cd frontend && npm install
cd ../backend && npm install
```

### 3. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3000
IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
CONTRACT_PACKAGE_ID=YOUR_PACKAGE_ID_HERE
OPERATOR_REGISTRY_ID=YOUR_REGISTRY_ID_HERE
FRONTEND_URL=http://localhost:5173
```

#### Frontend Configuration

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_IOTA_NETWORK=testnet
```

### 4. Deploy Smart Contracts

See detailed instructions in [`contracts/DEPLOYMENT_INSTRUCTIONS.md`](contracts/DEPLOYMENT_INSTRUCTIONS.md)

```bash
cd contracts

# Configure Sui CLI (first time only)
sui client

# Build contracts
sui move build

# Deploy to testnet
sui client publish --gas-budget 100000000 --json > deploy_output.json

# Extract deployment info
node extract-deployment-info.js deploy_output.json --write
```

This will automatically update `backend/.env` with contract addresses.

### 5. Run the Application

#### Start Backend

```bash
cd backend
npm run dev
```

Backend will be available at: http://localhost:3000

#### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at: http://localhost:5173

## 📚 Documentation

### Setup & Deployment
- [Contract Deployment Guide](contracts/DEPLOYMENT_INSTRUCTIONS.md)
- [Backend Configuration](backend/CONFIGURATION.md)
- [Backend Deployment](backend/DEPLOYMENT_GUIDE.md)
- [Frontend Deployment](frontend/DEPLOYMENT_GUIDE.md)

### Demo & Testing
- [Demo Setup Guide](DEMO_SETUP_GUIDE.md)
- [Demo Script](DEMO_SCRIPT.md)

### Development
- [Requirements](/.kiro/specs/emcs-blockchain-demo/requirements.md)
- [Design Document](/.kiro/specs/emcs-blockchain-demo/design.md)
- [Implementation Tasks](/.kiro/specs/emcs-blockchain-demo/tasks.md)

## Project Structure

```
EMCS - IOTA/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client services
│   │   ├── stores/          # State management
│   │   └── App.tsx          # Main app component
│   ├── public/              # Static assets
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── backend/                  # Express API server
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   │   ├── iotaService.ts
│   │   │   ├── arcGenerator.ts
│   │   │   └── notarizationService.ts
│   │   └── server.ts        # Server entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── contracts/                # Move smart contracts
│   ├── sources/
│   │   ├── consignment.move
│   │   └── operator_registry.move
│   └── Move.toml            # Move package configuration
│
├── .kiro/                    # Kiro spec files
│   └── specs/
│       └── emcs-blockchain-demo/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
├── .gitignore
├── .prettierrc
├── .env.example
└── README.md
```

## Development

### Frontend Development

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Backend Development

```bash
cd backend
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm start            # Run compiled code
npm run lint         # Run ESLint
```

### Smart Contract Development

```bash
cd contracts
sui move build       # Compile Move contracts
sui move test        # Run Move tests
```

## 🔌 API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /api` - API information and endpoint list

### Consignments
- `POST /api/consignments` - Create new consignment
  ```json
  {
    "consignor": "0x...",
    "consignee": "0x...",
    "goodsType": "Wine",
    "quantity": 1000,
    "unit": "Liters",
    "origin": "Bordeaux, France",
    "destination": "Berlin, Germany"
  }
  ```

- `GET /api/consignments?operator={address}&status={status}` - List consignments
- `GET /api/consignments/:arc` - Get consignment details
- `POST /api/consignments/:arc/dispatch` - Dispatch consignment
- `POST /api/consignments/:arc/receive` - Confirm receipt
- `GET /api/consignments/:arc/events` - Get movement history

For detailed API documentation, see [Backend API Documentation](backend/CONFIGURATION.md#testing-configuration)

## 👤 User Flow

### Consignor (Sender) Workflow
1. **Connect Wallet** - Connect IOTA wallet to authenticate
2. **Create Consignment** - Fill form with shipment details
   - Consignee address
   - Goods type (Wine, Beer, Spirits, Tobacco, Energy)
   - Quantity and unit
   - Origin and destination
3. **Receive ARC** - System generates unique Administrative Reference Code
4. **View Dashboard** - See consignment in "Draft" status
5. **Dispatch** - When ready to ship:
   - Click "Dispatch" button
   - System creates e-AD document
   - Document hash anchored on blockchain
   - Status changes to "In Transit"
6. **Track** - Monitor consignment status and movement history

### Consignee (Receiver) Workflow
1. **Connect Wallet** - Connect IOTA wallet to authenticate
2. **View Dashboard** - See incoming consignments in "In Transit" status
3. **Track** - View consignment details and movement history
4. **Receive** - When goods arrive:
   - Click "Confirm Receipt" button
   - Status changes to "Received"
   - Movement cycle complete
5. **Verify** - View complete audit trail on blockchain

### Observer Workflow
1. **Enter ARC** - Input Administrative Reference Code
2. **View Details** - See all consignment information
3. **Scan QR Code** - Quick access via QR code
4. **Check History** - View complete movement timeline
5. **Verify on Blockchain** - Click transaction IDs to view on explorer

## Blockchain Features

### Consignment NFT Structure

Each consignment is represented as a unique NFT object on IOTA blockchain with:

- **Unique identifier (ARC)** - EU Administrative Reference Code
- **Consignor and consignee addresses** - Blockchain wallet addresses
- **Goods type, quantity, and unit** - Wine, Beer (5000 Liters), etc.
- **Origin and destination locations** - Geographic tracking
- **Transport modes** - Road, Rail, Sea (multi-select)
- **Beer-specific fields** - Beer name, ABV %, excise duty
- **Status** - Draft, In Transit, Received (state machine)
- **Document hash (SHA256)** - Cryptographic document proof
- **Timestamps** - Created, dispatched, received (milliseconds)

**Object Storage Model**:
- Each consignment = 1 independent on-chain NFT object
- NOT stored in central array/mapping
- Shared between consignor & consignee
- Queried by object ID, owner address, or events
- Permanently stored on blockchain

### Movement Events

Events emitted for complete audit trail:

- **Created event** - Consignment created with consignor details
- **Dispatched event** - Document hash anchored, status change
- **Received event** - Consignee signature, completion
- **Movement event** - Generic backward-compatible event

All events are indexed and queryable on IOTA Explorer.

## Security

- Wallet-based authentication
- Authorization checks on all state transitions
- Immutable blockchain records
- SHA256 document hashing
- CORS protection
- Input validation

## Testing

### Frontend Tests (Optional)

```bash
cd frontend
npm test
```

### Backend Tests (Optional)

```bash
cd backend
npm test
```

### Move Tests (Optional)

```bash
cd contracts
sui move test
```

## 🌐 Deployment

### Smart Contracts (IOTA Testnet)

See [Contract Deployment Guide](contracts/DEPLOYMENT_INSTRUCTIONS.md)

```bash
cd contracts
sui move build
sui client publish --gas-budget 100000000
```

### Backend API

**Deployed on Railway**: https://emcs-iota-production.up.railway.app

See [Backend Deployment Guide](backend/DEPLOYMENT_GUIDE.md)

**Railway Deployment**:
```bash
cd backend
railway init
railway up
railway variables set IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
railway variables set CONTRACT_PACKAGE_ID=YOUR_PACKAGE_ID
railway variables set OPERATOR_REGISTRY_ID=YOUR_REGISTRY_ID
railway domain  # Get your Railway domain
```

**Alternative Platforms**: Render, Heroku

### Frontend

**Deployed on Netlify**: https://691a197355dea100089c0d03--emcs-on-ota-smart-contracts.netlify.app

See [Frontend Deployment Guide](frontend/DEPLOYMENT_GUIDE.md)

**Netlify Deployment**:
```bash
cd frontend
# Configure in netlify.toml or Netlify dashboard
# Environment variables:
# - VITE_API_URL=https://emcs-iota-production.up.railway.app
# - VITE_IOTA_NETWORK=testnet
```

**Alternative Platform**: Vercel

**Features**:
- Landing page with comprehensive EMCS and IOTA information
- "Launch App" button navigates to login/dashboard
- Fully responsive design with TailwindCSS
- Integrated with Railway backend via environment variables

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
```

### Frontend Tests
```bash
cd frontend
npm test                    # Run all tests
npm run test:watch          # Watch mode
```

### Smart Contract Tests
```bash
cd contracts
sui move test               # Run Move tests
```

### API Testing
```bash
cd backend
./test-api.sh              # Linux/Mac
test-api.bat               # Windows
```

### Build Testing
```bash
cd frontend
./test-build.sh            # Linux/Mac
test-build.bat             # Windows
```

## 🎬 Demo

### Quick Demo Setup

1. Create demo wallets and fund with testnet tokens
2. Create 2-3 test consignments with different statuses
3. Practice complete workflow

See [Demo Setup Guide](DEMO_SETUP_GUIDE.md) and [Demo Script](DEMO_SCRIPT.md) for detailed instructions.

### Demo Video

[Add link to demo video if available]

### Screenshots

[Add screenshots of key features]

## 🔧 Troubleshooting

### Wallet Connection Issues
**Problem**: Wallet doesn't connect

**Solutions**:
- Ensure IOTA Wallet extension is installed
- Check wallet is on IOTA Testnet
- Refresh page and try reconnecting
- Try different browser
- Check browser console for errors

### Transaction Failures
**Problem**: Transactions fail or timeout

**Solutions**:
- Verify sufficient testnet tokens: `sui client gas`
- Check contract addresses in `backend/.env`
- Verify IOTA network status
- Increase gas budget if needed
- Check wallet is on correct network

### API Errors
**Problem**: Frontend can't reach backend

**Solutions**:
- Verify backend is running: `curl http://localhost:3000/health`
- Check CORS configuration in `backend/.env`
- Ensure `FRONTEND_URL` matches frontend origin
- Verify `VITE_API_URL` in frontend `.env`
- Check browser console for specific errors

### Build Failures
**Problem**: Build fails with errors

**Solutions**:
- Run `npm install` to ensure dependencies installed
- Check Node version: `node --version` (should be 20+)
- Clear build cache: `rm -rf dist node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Review error messages for specific issues

### CORS Errors
**Problem**: "Access-Control-Allow-Origin" error

**Solutions**:
- Update `FRONTEND_URL` in backend `.env`
- Ensure no trailing slash in URLs
- Include protocol (http:// or https://)
- Restart backend after changing `.env`
- Check browser console for exact error

For more troubleshooting, see:
- [Backend Configuration Guide](backend/CONFIGURATION.md#troubleshooting)
- [Frontend Deployment Guide](frontend/DEPLOYMENT_GUIDE.md#troubleshooting)
- [Contract Deployment Guide](contracts/DEPLOYMENT_INSTRUCTIONS.md#troubleshooting)

## 🤝 Contributing

This is a hackathon project built for Moveathon Europe. Contributions, issues, and feature requests are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Follow existing code style
- Run linters before committing: `npm run lint`
- Write meaningful commit messages
- Add tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Latest Updates (November 2025)

### ✅ Production Deployment Complete
- **Frontend**: Deployed on Netlify with custom landing page
- **Backend**: Deployed on Railway with CORS configuration for Netlify
- **Smart Contracts**: Live on IOTA Testnet

### 🆕 Recent Features
- **Landing Page**: Comprehensive single-page with EMCS/IOTA information, features comparison, and "Launch App" CTA
- **Video Screenplay**: Complete 3-4 minute demo script with scene-by-scene breakdown (see VIDEO_SCREENPLAY.md)
- **IOTA Identity Integration**: Added @iota/identity-wasm SDK for decentralized identity support
- **CORS Updates**: Backend configured to allow Netlify domain for cross-origin requests
- **Route Restructuring**: Landing page on `/`, dashboard on `/dashboard/*` for better UX

### 📊 Deployment Architecture
```
Netlify (Frontend) ──HTTPS──> Railway (Backend) ──IOTA SDK──> IOTA Testnet (Smart Contracts)
```

### 🔗 Quick Links
- **Live App**: https://691a197355dea100089c0d03--emcs-on-ota-smart-contracts.netlify.app
- **API Health**: https://emcs-iota-production.up.railway.app/health
- **Explorer**: https://explorer.iota.cafe/txblock/3BEWkH5GTNP5WeidbanBQxy5DYs7go4H2TvgXNnUcuzf?network=testnet

---

**Built with ❤️ for Moveathon Europe 2025**
