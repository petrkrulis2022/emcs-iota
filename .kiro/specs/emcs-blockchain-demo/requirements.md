# Requirements Document

## Introduction

The EMCS Blockchain Demo is a decentralized excise goods tracking system built on IOTA blockchain for the Moveathon Europe hackathon. The system digitizes the EU's Electronic Movement and Control System (EMCS) framework, enabling traders to create, track, and verify excise goods shipments with immutable blockchain records. The solution addresses €8-12B in annual EU tax evasion by providing transparent, real-time tracking of cross-border excise goods movements.

## Glossary

- **EMCS_System**: The blockchain-based Electronic Movement and Control System application
- **Consignment**: A shipment record of excise goods being transported between operators
- **ARC**: Administrative Reference Code - unique identifier for each consignment
- **e-AD**: Electronic Administrative Document - digital shipment record
- **Consignor**: The operator dispatching excise goods
- **Consignee**: The operator receiving excise goods
- **IOTA_Blockchain**: The distributed ledger technology used for immutable record storage
- **NFT**: Non-Fungible Token representing a unique consignment on-chain
- **Wallet**: Browser extension for blockchain authentication and transaction signing
- **Movement_Event**: A state change in the consignment lifecycle (created, dispatched, received)
- **Operator**: A business entity authorized to trade excise goods
- **Dashboard**: The main user interface displaying all consignments and their status

## Requirements

### Requirement 1

**User Story:** As a consignor, I want to create a new consignment record with shipment details, so that I can initiate a tracked movement of excise goods.

#### Acceptance Criteria

1. WHEN the consignor submits a consignment form with valid data, THE EMCS_System SHALL generate a unique ARC
2. WHEN the consignor submits a consignment form, THE EMCS_System SHALL mint an NFT on IOTA_Blockchain representing the consignment
3. WHEN the NFT is minted, THE EMCS_System SHALL store consignment metadata including consignor address, consignee address, goods type, quantity, and origin location
4. WHEN the consignment is created, THE EMCS_System SHALL set the initial status to "Draft"
5. WHEN the consignment creation succeeds, THE EMCS_System SHALL display the ARC and confirmation message to the consignor

### Requirement 2

**User Story:** As a consignor, I want to dispatch a consignment, so that the consignee knows the goods are in transit and the movement is recorded on-chain.

#### Acceptance Criteria

1. WHEN the consignor initiates dispatch for a Draft consignment, THE EMCS_System SHALL update the consignment status to "In Transit"
2. WHEN the status changes to "In Transit", THE EMCS_System SHALL record a Movement_Event with timestamp on IOTA_Blockchain
3. WHEN the dispatch is confirmed, THE EMCS_System SHALL hash the e-AD document using SHA256
4. WHEN the document hash is generated, THE EMCS_System SHALL anchor the hash to IOTA_Blockchain via notarization service
5. WHEN dispatch completes, THE EMCS_System SHALL display updated status on the Dashboard

### Requirement 3

**User Story:** As a consignee, I want to confirm receipt of a consignment, so that the movement is officially closed and recorded as complete.

#### Acceptance Criteria

1. WHEN the consignee confirms receipt of an "In Transit" consignment, THE EMCS_System SHALL update the consignment status to "Received"
2. WHEN the status changes to "Received", THE EMCS_System SHALL record a Movement_Event with timestamp and consignee signature on IOTA_Blockchain
3. WHEN receipt is confirmed, THE EMCS_System SHALL verify the consignee Wallet address matches the consignment consignee address
4. IF the Wallet address does not match the consignee address, THEN THE EMCS_System SHALL reject the receipt confirmation with an error message
5. WHEN receipt confirmation succeeds, THE EMCS_System SHALL display the completed consignment with final status on the Dashboard

### Requirement 4

**User Story:** As an operator, I want to view all consignments on a dashboard, so that I can monitor active shipments and their current status.

#### Acceptance Criteria

1. WHEN the operator accesses the Dashboard, THE EMCS_System SHALL display all consignments associated with the operator's Wallet address
2. WHEN displaying consignments, THE EMCS_System SHALL show ARC, goods type, quantity, status, consignor, consignee, and creation date for each consignment
3. WHEN the operator selects a consignment, THE EMCS_System SHALL display detailed movement history with all Movement_Events and timestamps
4. WHEN the Dashboard loads, THE EMCS_System SHALL fetch consignment data from IOTA_Blockchain in real-time
5. WHEN new Movement_Events occur, THE EMCS_System SHALL update the Dashboard display within 5 seconds

### Requirement 5

**User Story:** As an operator, I want to track a consignment using its ARC, so that I can verify shipment details and movement history.

#### Acceptance Criteria

1. WHEN the operator enters an ARC in the tracking interface, THE EMCS_System SHALL retrieve the corresponding consignment from IOTA_Blockchain
2. WHEN the consignment is retrieved, THE EMCS_System SHALL display a QR code encoding the ARC
3. WHEN the consignment details are displayed, THE EMCS_System SHALL show all Movement_Events in chronological order
4. IF the ARC does not exist on IOTA_Blockchain, THEN THE EMCS_System SHALL display an error message indicating invalid ARC
5. WHEN the operator scans a QR code containing an ARC, THE EMCS_System SHALL automatically load the consignment tracking page

### Requirement 6

**User Story:** As an operator, I want to connect my blockchain wallet to the application, so that I can authenticate and sign transactions securely.

#### Acceptance Criteria

1. WHEN the operator clicks the wallet connection button, THE EMCS_System SHALL prompt the Wallet browser extension to connect
2. WHEN the Wallet connection is established, THE EMCS_System SHALL display the operator's wallet address in the user interface
3. WHEN the operator is not connected, THE EMCS_System SHALL disable all transaction features (create, dispatch, receive)
4. WHEN the operator disconnects the Wallet, THE EMCS_System SHALL clear the session and return to the connection prompt
5. WHEN a transaction requires signing, THE EMCS_System SHALL request signature approval from the connected Wallet

### Requirement 7

**User Story:** As a system administrator, I want consignment data to be immutably stored on IOTA blockchain, so that the audit trail cannot be tampered with.

#### Acceptance Criteria

1. WHEN a consignment is created, THE EMCS_System SHALL store the consignment object on IOTA_Blockchain using Move smart contracts
2. WHEN a Movement_Event occurs, THE EMCS_System SHALL append the event to the on-chain consignment record
3. WHEN document hashing is performed, THE EMCS_System SHALL use SHA256 algorithm for cryptographic integrity
4. WHEN the hash is generated, THE EMCS_System SHALL anchor the hash to IOTA_Blockchain via the notarization service
5. THE EMCS_System SHALL NOT use external databases for consignment storage, ensuring IOTA_Blockchain is the single source of truth

### Requirement 8

**User Story:** As a developer, I want the system to use IOTA Move smart contracts for state management, so that consignment logic is executed on-chain with transparency.

#### Acceptance Criteria

1. THE EMCS_System SHALL implement a Consignment Move module that defines NFT structure and state transitions
2. THE EMCS_System SHALL implement an Operator_Registry Move module that maintains an allow list of authorized operators
3. WHEN a state transition is requested, THE EMCS_System SHALL execute the corresponding Move function on IOTA_Blockchain
4. WHEN Move functions execute, THE EMCS_System SHALL emit events that can be queried for movement history
5. THE EMCS_System SHALL validate all state transitions according to the consignment lifecycle rules (Draft → In Transit → Received)

### Requirement 9

**User Story:** As an operator, I want the system to generate unique ARCs automatically, so that each consignment has a distinct identifier for tracking.

#### Acceptance Criteria

1. WHEN a consignment is created, THE EMCS_System SHALL generate an ARC using a combination of timestamp, operator address, and random nonce
2. THE EMCS_System SHALL format the ARC as a 21-character alphanumeric string following the pattern: YYAANNNNNNNNNNNNNNNNC
3. WHEN generating an ARC, THE EMCS_System SHALL ensure uniqueness by checking against existing ARCs on IOTA_Blockchain
4. IF an ARC collision is detected, THEN THE EMCS_System SHALL regenerate the ARC with a new random nonce
5. WHEN the ARC is generated, THE EMCS_System SHALL associate it permanently with the consignment NFT

### Requirement 10

**User Story:** As a hackathon judge, I want to see a polished demo interface with clear visual feedback, so that I can evaluate the system's usability and functionality.

#### Acceptance Criteria

1. WHEN the operator performs any action, THE EMCS_System SHALL display loading indicators during blockchain transaction processing
2. WHEN a transaction succeeds, THE EMCS_System SHALL display a success notification with transaction details
3. WHEN a transaction fails, THE EMCS_System SHALL display an error notification with a clear error message
4. THE EMCS_System SHALL use a responsive design that adapts to desktop and tablet screen sizes
5. WHEN displaying consignment status, THE EMCS_System SHALL use color-coded badges (Draft: gray, In Transit: blue, Received: green)
