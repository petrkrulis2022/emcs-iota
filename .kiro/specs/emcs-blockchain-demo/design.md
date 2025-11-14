# Design Document

## Overview

The EMCS Blockchain Demo is a three-tier decentralized application built on IOTA blockchain. The architecture consists of a React frontend (user interface), Node.js/Express backend (API and business logic), and IOTA Move smart contracts (on-chain state management). The system leverages IOTA's feeless transactions and object-based storage model to create an immutable audit trail for excise goods movements.

The design prioritizes simplicity and demo-readiness for the 48-hour hackathon timeline while maintaining blockchain best practices. All consignment data lives on-chain as NFTs, eliminating the need for external databases and showcasing true decentralization.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │ Consignment  │  │   Tracking   │      │
│  │   Component  │  │     Form     │  │   Component  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Wallet SDK    │                        │
│                    │  (IOTA Connect)│                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────▼──────────────────────────────────┐
│                Backend API (Node.js + Express)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Consignment  │  │  Notarization│  │     ARC      │       │
│  │   Routes     │  │   Service    │  │  Generator   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│           │                │                  │               │
│           └────────────────┴──────────────────┘               │
│                            │                                  │
│                    ┌───────▼────────┐                         │
│                    │  IOTA SDK      │                         │
│                    │  (@iota/sdk)   │                         │
│                    └───────┬────────┘                         │
└────────────────────────────┼───────────────────────────────────┘
```

                             │ RPC

┌────────────────────────────▼───────────────────────────────────┐
│ IOTA Blockchain (Testnet) │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Move Smart Contracts │ │
│ │ ┌──────────────────┐ ┌──────────────────┐ │ │
│ │ │ Consignment │ │ Operator │ │ │
│ │ │ Module │ │ Registry Module │ │ │
│ │ └──────────────────┘ └──────────────────┘ │ │
│ └──────────────────────────────────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Object Storage │ │
│ │ - Consignment NFTs │ │
│ │ - Movement Events │ │
│ │ - Document Hashes │ │
│ └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

````

### Technology Stack

**Frontend:**
- React 18.3+ with TypeScript
- Vite 5.x for build tooling
- IOTA Wallet SDK (@iota/wallet-standard)
- TailwindCSS for styling
- QRCode.react for QR generation
- React Router for navigation
- Zustand for state management

**Backend:**
- Node.js 20.x LTS
- Express 4.x
- IOTA SDK (@iota/sdk)
- Crypto (built-in) for SHA256 hashing
- CORS middleware
- dotenv for configuration

**Blockchain:**
- IOTA Testnet
- Move language for smart contracts
- IOTA Move framework

**Development Tools:**
- TypeScript 5.x
- ESLint + Prettier
- Vitest (optional testing)

## Components and Interfaces

### Frontend Components

#### 1. WalletConnect Component
**Purpose:** Manages wallet connection and authentication

**Props:**
```typescript
interface WalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}
````

**State:**

- `isConnected: boolean`
- `walletAddress: string | null`
- `isConnecting: boolean`

**Key Methods:**

- `connectWallet()`: Initiates wallet connection flow
- `disconnectWallet()`: Clears wallet session
- `getWalletAddress()`: Returns current connected address

**Integration:**

- Uses IOTA Wallet Standard API
- Detects browser extension (e.g., IOTA Wallet)
- Handles connection errors gracefully

---

#### 2. ConsignmentForm Component

**Purpose:** Creates new consignment records

**Props:**

```typescript
interface ConsignmentFormProps {
  walletAddress: string;
  onSuccess: (arc: string) => void;
}
```

**Form Fields:**

- Consignee address (text input)
- Goods type (dropdown: Wine, Beer, Spirits, Tobacco, Energy)
- Quantity (number input)
- Unit (dropdown: Liters, Kilograms, Units)
- Origin location (text input)
- Destination location (text input)

**Validation:**

- All fields required
- Consignee address must be valid IOTA address format
- Quantity must be positive number

**Submission Flow:**

1. Validate form data
2. Call backend API: `POST /api/consignments`
3. Wait for blockchain confirmation
4. Display ARC and success message
5. Reset form

---

#### 3. Dashboard Component

**Purpose:** Displays all consignments for connected operator

**State:**

- `consignments: Consignment[]`
- `loading: boolean`
- `filter: 'all' | 'draft' | 'in-transit' | 'received'`

**Data Fetching:**

- Fetches on mount: `GET /api/consignments?operator={address}`
- Polls every 10 seconds for updates
- Filters by status locally

**Display:**

- Table/card view of consignments
- Columns: ARC, Goods Type, Quantity, Status, Consignor, Consignee, Created Date
- Action buttons: View Details, Dispatch (if Draft), Confirm Receipt (if In Transit)

---

#### 4. ConsignmentDetails Component

**Purpose:** Shows detailed view of single consignment with movement history

**Props:**

```typescript
interface ConsignmentDetailsProps {
  arc: string;
}
```

**Sections:**

- Header: ARC with QR code
- Shipment Info: Goods, quantity, locations
- Parties: Consignor and consignee addresses
- Movement Timeline: All events with timestamps
- Actions: Dispatch or Receive buttons (context-dependent)

**Data Fetching:**

- `GET /api/consignments/{arc}`
- `GET /api/consignments/{arc}/events`

---

#### 5. QRCodeDisplay Component

**Purpose:** Generates and displays QR code for ARC

**Props:**

```typescript
interface QRCodeDisplayProps {
  arc: string;
  size?: number;
}
```

**Implementation:**

- Uses `qrcode.react` library
- Encodes ARC as plain text
- Includes download button for QR image

---

### Backend API Endpoints

#### POST /api/consignments

**Purpose:** Create new consignment

**Request Body:**

```json
{
  "consignor": "0x123...",
  "consignee": "0x456...",
  "goodsType": "Wine",
  "quantity": 1000,
  "unit": "Liters",
  "origin": "Bordeaux, France",
  "destination": "Berlin, Germany"
}
```

**Response:**

```json
{
  "success": true,
  "arc": "24FR12345678901234567",
  "transactionId": "0xabc...",
  "consignmentId": "0xdef..."
}
```

**Process:**

1. Generate unique ARC
2. Create consignment object
3. Call Move contract to mint NFT
4. Return ARC and transaction ID

---

#### GET /api/consignments

**Purpose:** List consignments for operator

**Query Parameters:**

- `operator`: Wallet address (required)
- `status`: Filter by status (optional)

**Response:**

```json
{
  "consignments": [
    {
      "arc": "24FR12345678901234567",
      "consignor": "0x123...",
      "consignee": "0x456...",
      "goodsType": "Wine",
      "quantity": 1000,
      "unit": "Liters",
      "status": "Draft",
      "createdAt": "2025-11-13T10:00:00Z"
    }
  ]
}
```

---

#### GET /api/consignments/:arc

**Purpose:** Get consignment details by ARC

**Response:**

```json
{
  "arc": "24FR12345678901234567",
  "consignor": "0x123...",
  "consignee": "0x456...",
  "goodsType": "Wine",
  "quantity": 1000,
  "unit": "Liters",
  "origin": "Bordeaux, France",
  "destination": "Berlin, Germany",
  "status": "In Transit",
  "createdAt": "2025-11-13T10:00:00Z",
  "dispatchedAt": "2025-11-13T11:00:00Z",
  "documentHash": "0x789..."
}
```

---

#### POST /api/consignments/:arc/dispatch

**Purpose:** Dispatch consignment (change status to In Transit)

**Request Body:**

```json
{
  "consignor": "0x123..."
}
```

**Response:**

```json
{
  "success": true,
  "transactionId": "0xabc...",
  "documentHash": "0x789...",
  "dispatchedAt": "2025-11-13T11:00:00Z"
}
```

**Process:**

1. Verify consignor matches consignment
2. Hash e-AD document (SHA256)
3. Anchor hash to IOTA via notarization
4. Call Move contract to update status
5. Record movement event

---

#### POST /api/consignments/:arc/receive

**Purpose:** Confirm receipt of consignment

**Request Body:**

```json
{
  "consignee": "0x456..."
}
```

**Response:**

```json
{
  "success": true,
  "transactionId": "0xabc...",
  "receivedAt": "2025-11-13T15:00:00Z"
}
```

**Process:**

1. Verify consignee matches consignment
2. Call Move contract to update status
3. Record movement event
4. Mark consignment as complete

---

#### GET /api/consignments/:arc/events

**Purpose:** Get movement history for consignment

**Response:**

```json
{
  "events": [
    {
      "type": "Created",
      "timestamp": "2025-11-13T10:00:00Z",
      "actor": "0x123...",
      "transactionId": "0xabc..."
    },
    {
      "type": "Dispatched",
      "timestamp": "2025-11-13T11:00:00Z",
      "actor": "0x123...",
      "transactionId": "0xdef...",
      "documentHash": "0x789..."
    }
  ]
}
```

---

### Backend Services

#### ARC Generator Service

**Purpose:** Generate unique Administrative Reference Codes

**Method:**

```typescript
generateARC(consignor: string): string
```

**Algorithm:**

1. Extract year (YY) from current date
2. Extract country code (AA) from consignor address (default: "EU")
3. Generate 16-digit random number (NNNNNNNNNNNNNNNN)
4. Calculate check digit (C) using Luhn algorithm
5. Format: `YYAANNNNNNNNNNNNNNNNC`

**Uniqueness Check:**

- Query IOTA blockchain for existing ARC
- Retry with new random number if collision detected

---

#### Notarization Service

**Purpose:** Hash documents and anchor to IOTA blockchain

**Method:**

```typescript
notarizeDocument(document: object): Promise<string>
```

**Process:**

1. Serialize document to JSON
2. Compute SHA256 hash
3. Create IOTA transaction with hash in metadata
4. Submit transaction to blockchain
5. Return transaction ID

**Document Structure:**

```json
{
  "arc": "24FR12345678901234567",
  "consignor": "0x123...",
  "consignee": "0x456...",
  "goodsType": "Wine",
  "quantity": 1000,
  "timestamp": "2025-11-13T11:00:00Z"
}
```

---

#### IOTA SDK Service

**Purpose:** Interact with IOTA blockchain and Move contracts

**Methods:**

```typescript
// Initialize connection
connect(rpcUrl: string): Promise<void>

// Call Move contract functions
createConsignment(data: ConsignmentData): Promise<string>
updateStatus(arc: string, status: Status): Promise<string>
getConsignment(arc: string): Promise<Consignment>
getConsignmentsByOperator(address: string): Promise<Consignment[]>

// Query events
getMovementEvents(arc: string): Promise<Event[]>
```

**Configuration:**

- RPC URL: IOTA Testnet endpoint
- Gas budget: Auto-calculated
- Retry logic: 3 attempts with exponential backoff

## Data Models

### Consignment Object (On-Chain)

```move
struct Consignment has key, store {
    id: UID,
    arc: String,
    consignor: address,
    consignee: address,
    goods_type: String,
    quantity: u64,
    unit: String,
    origin: String,
    destination: String,
    status: u8, // 0=Draft, 1=InTransit, 2=Received
    document_hash: Option<vector<u8>>,
    created_at: u64,
    dispatched_at: Option<u64>,
    received_at: Option<u64>
}
```

**Status Enum:**

- `0`: Draft (created but not dispatched)
- `1`: In Transit (dispatched, awaiting receipt)
- `2`: Received (completed)

---

### Movement Event (On-Chain)

```move
struct MovementEvent has copy, drop {
    arc: String,
    event_type: u8, // 0=Created, 1=Dispatched, 2=Received
    actor: address,
    timestamp: u64,
    transaction_id: address
}
```

**Event Types:**

- `0`: Created
- `1`: Dispatched
- `2`: Received

---

### Operator Registry (On-Chain)

```move
struct OperatorRegistry has key {
    id: UID,
    operators: VecMap<address, bool>
}
```

**Purpose:** Simple allow/deny list for authorized operators (future enhancement)

---

### Frontend TypeScript Types

```typescript
interface Consignment {
  arc: string;
  consignor: string;
  consignee: string;
  goodsType: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  status: "Draft" | "In Transit" | "Received";
  documentHash?: string;
  createdAt: string;
  dispatchedAt?: string;
  receivedAt?: string;
}

interface MovementEvent {
  type: "Created" | "Dispatched" | "Received";
  timestamp: string;
  actor: string;
  transactionId: string;
  documentHash?: string;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Error Handling

### Frontend Error Handling

**Wallet Connection Errors:**

- No wallet extension detected → Display installation instructions
- User rejects connection → Show "Connection required" message
- Network mismatch → Prompt to switch to IOTA Testnet

**API Errors:**

- Network timeout → Retry with exponential backoff (3 attempts)
- 400 Bad Request → Display validation errors from response
- 401 Unauthorized → Prompt wallet reconnection
- 500 Server Error → Display generic error message with support contact

**Form Validation:**

- Client-side validation before submission
- Display inline error messages for invalid fields
- Disable submit button until all fields valid

---

### Backend Error Handling

**Validation Errors:**

- Return 400 status with detailed error messages
- Validate all inputs before blockchain interaction

**Blockchain Errors:**

- Transaction failure → Return 500 with transaction ID for debugging
- Insufficient gas → Return 402 with gas estimate
- Contract execution failure → Log error and return user-friendly message

**ARC Collision:**

- Retry generation up to 5 times
- If all retries fail, return 500 error

**Notarization Errors:**

- IOTA node unavailable → Retry with backup RPC endpoint
- Transaction rejected → Log details and return error

---

### Move Contract Error Handling

**Status Transition Validation:**

```move
assert!(consignment.status == DRAFT, EInvalidStatusTransition);
```

**Authorization Checks:**

```move
assert!(tx_context::sender(ctx) == consignment.consignor, EUnauthorized);
```

**Error Codes:**

- `EInvalidStatusTransition = 1`: Attempted invalid status change
- `EUnauthorized = 2`: Caller not authorized for action
- `EConsignmentNotFound = 3`: ARC does not exist
- `EInvalidARC = 4`: Malformed ARC format

## Testing Strategy

### Frontend Testing

**Unit Tests (Optional):**

- ARC validation logic
- Form validation functions
- Date formatting utilities

**Component Tests (Optional):**

- WalletConnect connection flow
- ConsignmentForm submission
- Dashboard filtering

**Manual Testing (Required):**

- Complete user flow: connect → create → dispatch → receive
- Wallet connection/disconnection
- Error scenarios (invalid inputs, network errors)
- Responsive design on different screen sizes

---

### Backend Testing

**Unit Tests (Optional):**

- ARC generation algorithm
- SHA256 hashing
- Input validation

**Integration Tests (Optional):**

- API endpoints with mock IOTA SDK
- Notarization service

**Manual Testing (Required):**

- All API endpoints with Postman/curl
- IOTA blockchain integration on testnet
- Error handling scenarios

---

### Smart Contract Testing

**Move Unit Tests (Optional):**

- Consignment creation
- Status transitions
- Authorization checks

**Testnet Deployment (Required):**

- Deploy contracts to IOTA Testnet
- Test all functions via backend API
- Verify events are emitted correctly

---

### End-to-End Testing

**Demo Scenario (Required):**

1. Connect wallet as Consignor A
2. Create consignment for Consignee B
3. Verify ARC generated and displayed
4. Dispatch consignment
5. Verify status updated to "In Transit"
6. Disconnect and reconnect as Consignee B
7. Confirm receipt
8. Verify status updated to "Received"
9. View movement history with all events
10. Scan QR code and verify tracking works

**Performance Testing:**

- Dashboard loads within 3 seconds
- Transaction confirmation within 10 seconds
- QR code generation instant

## Implementation Notes

### IOTA-Specific Considerations

**Object Model:**

- Each consignment is a unique object (NFT) with UID
- Objects are owned by the contract, not individual users
- Use shared objects for multi-party access

**Transaction Structure:**

- Programmable Transaction Blocks (PTBs) for complex operations
- Gas payment handled automatically by SDK
- Sponsor transactions for better UX (optional)

**Event Indexing:**

- Use IOTA's event query API for movement history
- Events are indexed automatically by the network
- No need for external indexer for MVP

---

### Security Considerations

**Frontend:**

- Never expose private keys
- Validate all user inputs
- Use HTTPS for API calls
- Implement CORS properly

**Backend:**

- Validate wallet signatures for sensitive operations
- Rate limiting on API endpoints (optional for MVP)
- Environment variables for sensitive config
- Input sanitization to prevent injection

**Smart Contracts:**

- Authorization checks on all state-changing functions
- Validate status transitions
- Emit events for all important actions
- No reentrancy concerns (Move's ownership model prevents this)

---

### Deployment Strategy

**Frontend:**

- Build with Vite: `npm run build`
- Deploy to Vercel/Netlify
- Configure environment variables for API URL

**Backend:**

- Deploy to Railway/Render/Heroku
- Set environment variables:
  - `IOTA_RPC_URL`: Testnet RPC endpoint
  - `CONTRACT_ADDRESS`: Deployed Move contract address
  - `PORT`: Server port

**Smart Contracts:**

- Compile Move contracts: `sui move build`
- Deploy to IOTA Testnet: `sui client publish`
- Save package ID and object IDs for backend configuration

---

### Demo Preparation

**Pre-Demo Setup:**

1. Deploy contracts to testnet
2. Create 2-3 test wallets with testnet tokens
3. Pre-populate 1-2 sample consignments
4. Test complete flow end-to-end
5. Prepare backup plan (video recording)

**Demo Script:**

1. Show dashboard with existing consignments (30 sec)
2. Create new consignment (1 min)
3. Show ARC and QR code (30 sec)
4. Dispatch consignment (1 min)
5. Switch wallet and confirm receipt (1 min)
6. Show movement history timeline (30 sec)
7. Explain blockchain benefits (1 min)

**Talking Points:**

- Immutable audit trail prevents fraud
- Real-time tracking vs. 2-day delays in current EMCS
- Feeless transactions reduce costs for operators
- Decentralized = no single point of failure
- NFT representation enables future tokenization

---

### Future Enhancements (Post-Hackathon)

**Phase 2 Features:**

- IOTA Identity integration for operator verification
- Anomaly reporting (shortages, damages)
- Multi-signature approvals for high-value shipments
- Advanced filtering and search
- Export audit reports (PDF)

**Phase 3 Features:**

- Mobile app (React Native)
- IoT sensor integration (temperature, location)
- Automated customs notifications
- Analytics dashboard for authorities
- Integration with existing EMCS via API gateway

**Scalability:**

- Implement caching layer (Redis)
- Optimize blockchain queries
- Batch transaction processing
- CDN for frontend assets
