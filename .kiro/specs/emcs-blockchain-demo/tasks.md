# Implementation Plan

- [x] 1. Set up project structure and initialize repositories
  - Create monorepo structure with frontend, backend, and contracts directories
  - Initialize React + Vite project with TypeScript in `frontend/`
  - Initialize Node.js + Express project with TypeScript in `backend/`
  - Initialize Move project in `contracts/`
  - Configure ESLint, Prettier, and TypeScript configs for all projects
  - Create `.env.example` files with required environment variables
  - Write root `README.md` with project overview and setup instructions
  - _Requirements: All requirements depend on proper project setup_

- [x] 2. Implement IOTA Move smart contracts
  - _Requirements: 1.2, 1.3, 2.2, 3.2, 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2.1 Create Consignment module with NFT structure
  - Define `Consignment` struct with all required fields (arc, consignor, consignee, goods_type, quantity, unit, origin, destination, status, timestamps)
  - Implement `create_consignment` function that mints NFT and initializes with Draft status
  - Add status constants (DRAFT=0, IN_TRANSIT=1, RECEIVED=2)
  - Implement getter functions for consignment fields
  - _Requirements: 1.2, 1.3, 1.4, 7.1, 8.1_

- [x] 2.2 Implement status transition functions in Consignment module
  - Write `dispatch_consignment` function that transitions Draft → In Transit
  - Write `receive_consignment` function that transitions In Transit → Received
  - Add authorization checks (only consignor can dispatch, only consignee can receive)
  - Validate status transitions (prevent invalid state changes)
  - Store document hash on dispatch
  - Record timestamps for each transition
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 8.3, 8.5_

- [x] 2.3 Implement event emission for movement tracking
  - Define `MovementEvent` struct with event_type, actor, timestamp, transaction_id
  - Emit `ConsignmentCreated` event in create function
  - Emit `ConsignmentDispatched` event in dispatch function
  - Emit `ConsignmentReceived` event in receive function
  - _Requirements: 2.2, 3.2, 7.2, 8.4_

- [x] 2.4 Create Operator Registry module
  - Define `OperatorRegistry` struct with VecMap of authorized operators
  - Implement `init` function to create registry on deployment
  - Write `add_operator` function (admin only)
  - Write `is_authorized` function to check operator status
  - _Requirements: 8.2_

- [ ]\* 2.5 Write Move unit tests for smart contracts
  - Test consignment creation with valid data
  - Test status transitions (Draft → In Transit → Received)
  - Test authorization checks (unauthorized dispatch/receive should fail)
  - Test invalid status transitions (e.g., Draft → Received should fail)
  - Test event emission for all operations
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3. Build backend API foundation
  - _Requirements: 7.4, 7.5_

- [x] 3.1 Set up Express server with TypeScript
  - Initialize Express app with TypeScript configuration
  - Configure CORS middleware for frontend origin
  - Set up body-parser for JSON requests
  - Create error handling middleware
  - Implement request logging middleware
  - Configure environment variables (PORT, IOTA_RPC_URL, CONTRACT_ADDRESS)
  - Create `server.ts` entry point
  - _Requirements: All backend requirements_

- [x] 3.2 Implement IOTA SDK service
  - Install `@iota/sdk` package
  - Create `IOTAService` class with connection management
  - Implement `connect()` method to initialize SDK with RPC URL
  - Write `executeTransaction()` helper for submitting PTBs
  - Implement `queryEvents()` method for fetching movement events
  - Add retry logic with exponential backoff (3 attempts)
  - Handle gas budget calculation automatically
  - _Requirements: 7.1, 7.2, 7.4, 8.3, 8.4_

- [x] 3.3 Create ARC generator service
  - Create `ARCGenerator` class
  - Implement `generateARC()` method with algorithm: YYAANNNNNNNNNNNNNNNNC format
  - Extract year (YY) from current date
  - Use default country code "EU" (AA)
  - Generate 16-digit random number
  - Implement Luhn algorithm for check digit calculation
  - Add uniqueness check by querying blockchain
  - Implement retry logic (up to 5 attempts) for collision handling
  - _Requirements: 1.1, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 3.4 Implement notarization service
  - Create `NotarizationService` class
  - Implement `notarizeDocument()` method
  - Serialize document object to JSON
  - Compute SHA256 hash using Node.js crypto module
  - Create IOTA transaction with hash in metadata
  - Submit transaction via IOTA SDK
  - Return transaction ID
  - Add error handling for IOTA node unavailability
  - _Requirements: 2.3, 2.4, 7.3, 7.4_

- [x] 4. Implement consignment API endpoints
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.1 Create POST /api/consignments endpoint
  - Define route handler in `consignmentRoutes.ts`
  - Validate request body (consignor, consignee, goodsType, quantity, unit, origin, destination)
  - Generate unique ARC using ARCGenerator service
  - Build transaction to call Move `create_consignment` function
  - Execute transaction via IOTA SDK
  - Return response with ARC, transactionId, and consignmentId
  - Handle validation errors (400) and blockchain errors (500)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4.2 Create GET /api/consignments endpoint
  - Define route handler for listing consignments
  - Extract `operator` query parameter (required)
  - Extract optional `status` filter parameter
  - Query IOTA blockchain for consignments where operator is consignor or consignee
  - Filter by status if provided
  - Map blockchain objects to API response format
  - Return array of consignments
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 4.3 Create GET /api/consignments/:arc endpoint
  - Define route handler for single consignment lookup
  - Extract ARC from URL parameter
  - Query IOTA blockchain for consignment by ARC
  - Return 404 if consignment not found
  - Map blockchain object to detailed API response
  - Include all fields (arc, consignor, consignee, goods, status, timestamps, documentHash)
  - _Requirements: 5.1, 5.4_

- [x] 4.4 Create POST /api/consignments/:arc/dispatch endpoint
  - Define route handler for dispatching consignment
  - Extract ARC from URL parameter
  - Validate request body contains consignor address
  - Fetch consignment from blockchain
  - Verify consignor matches consignment.consignor
  - Verify current status is Draft
  - Create e-AD document object
  - Hash document using NotarizationService
  - Anchor hash to IOTA blockchain
  - Build transaction to call Move `dispatch_consignment` function
  - Execute transaction with document hash
  - Return response with transactionId, documentHash, and dispatchedAt timestamp
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.5 Create POST /api/consignments/:arc/receive endpoint
  - Define route handler for confirming receipt
  - Extract ARC from URL parameter
  - Validate request body contains consignee address
  - Fetch consignment from blockchain
  - Verify consignee matches consignment.consignee
  - Verify current status is In Transit
  - Build transaction to call Move `receive_consignment` function
  - Execute transaction
  - Return response with transactionId and receivedAt timestamp
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.6 Create GET /api/consignments/:arc/events endpoint
  - Define route handler for movement history
  - Extract ARC from URL parameter
  - Query IOTA events API for all MovementEvents with matching ARC
  - Map events to API response format (type, timestamp, actor, transactionId, documentHash)
  - Sort events chronologically
  - Return array of events
  - _Requirements: 4.3, 5.3_

- [x] 4.7 Write integration tests for API endpoints
  - Test POST /api/consignments with valid and invalid data
  - Test GET /api/consignments with operator filter
  - Test GET /api/consignments/:arc for existing and non-existing ARCs
  - Test POST /api/consignments/:arc/dispatch with authorization checks
  - Test POST /api/consignments/:arc/receive with authorization checks
  - Test GET /api/consignments/:arc/events
  - Mock IOTA SDK for isolated testing
  - _Requirements: All consignment API requirements_

- [x] 5. Build frontend foundation and wallet integration
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 5.1 Set up React app with routing and state management
  - Configure React Router with routes: /, /create, /consignment/:arc
  - Install and configure Zustand for global state management
  - Create `useWalletStore` with state: isConnected, walletAddress, connect, disconnect
  - Create `useConsignmentStore` with state: consignments, loading, fetchConsignments
  - Set up TailwindCSS configuration
  - Create base layout component with navigation
  - _Requirements: All frontend requirements_

- [x] 5.2 Implement WalletConnect component
  - Install `@iota/wallet-standard` package
  - Create `WalletConnect.tsx` component
  - Implement `connectWallet()` function using IOTA Wallet Standard API
  - Detect browser wallet extension
  - Handle connection approval/rejection
  - Store wallet address in Zustand store on successful connection
  - Implement `disconnectWallet()` function to clear session
  - Display wallet address (truncated) when connected
  - Show "Connect Wallet" button when disconnected
  - Handle errors: no extension, user rejection, network mismatch
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 5.3 Create API client service
  - Create `apiClient.ts` with axios instance
  - Configure base URL from environment variable
  - Implement typed functions for all API endpoints:
    - `createConsignment(data)`
    - `getConsignments(operator, status?)`
    - `getConsignment(arc)`
    - `dispatchConsignment(arc, consignor)`
    - `receiveConsignment(arc, consignee)`
    - `getConsignmentEvents(arc)`
  - Add request interceptor for error handling
  - Implement retry logic for network timeouts (3 attempts)
  - _Requirements: All API integration requirements_

- [x] 6. Implement consignment creation flow
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6.1 Create ConsignmentForm component
  - Create `ConsignmentForm.tsx` with form fields: consignee, goodsType, quantity, unit, origin, destination
  - Implement controlled inputs with React state
  - Add dropdown for goodsType (Wine, Beer, Spirits, Tobacco, Energy)
  - Add dropdown for unit (Liters, Kilograms, Units)
  - Implement client-side validation: all fields required, quantity > 0, valid IOTA address format
  - Display inline validation errors
  - Disable submit button when form invalid or wallet not connected
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 6.2 Implement form submission and blockchain interaction
  - Handle form submit event
  - Show loading spinner during submission
  - Call `apiClient.createConsignment()` with form data and connected wallet address
  - Wait for blockchain confirmation
  - Display success notification with generated ARC
  - Reset form after successful submission
  - Handle errors: validation errors (400), blockchain errors (500), network timeouts
  - Display user-friendly error messages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 10.1, 10.2, 10.3_

- [x] 6.3 Create success modal with ARC display
  - Create `SuccessModal.tsx` component
  - Display generated ARC prominently
  - Show transaction ID as clickable link to IOTA explorer
  - Add "View Consignment" button that navigates to detail page
  - Add "Create Another" button that closes modal and resets form
  - _Requirements: 1.5, 10.2_

- [x] 7. Build dashboard and consignment listing
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7.1 Create Dashboard component with data fetching
  - Create `Dashboard.tsx` component
  - Fetch consignments on mount using `apiClient.getConsignments(walletAddress)`
  - Store consignments in Zustand store
  - Implement polling: refetch every 10 seconds
  - Show loading spinner while fetching
  - Handle empty state: display "No consignments yet" message
  - Handle errors: display error message with retry button
  - _Requirements: 4.1, 4.4, 4.5_

- [x] 7.2 Implement consignment table/card view
  - Display consignments in responsive table (desktop) or cards (mobile)
  - Show columns: ARC, Goods Type, Quantity, Status, Consignor, Consignee, Created Date
  - Truncate long addresses (show first 6 and last 4 characters)
  - Format dates in readable format (e.g., "Nov 13, 2025 10:00 AM")
  - Add status badges with color coding: Draft (gray), In Transit (blue), Received (green)
  - Make rows clickable to navigate to detail page
  - _Requirements: 4.2, 10.5_

- [x] 7.3 Add status filtering
  - Create filter buttons: All, Draft, In Transit, Received
  - Implement local filtering of consignments by status
  - Highlight active filter button
  - Update displayed count (e.g., "Showing 5 of 10 consignments")
  - _Requirements: 4.1_

- [x] 7.4 Add action buttons for dispatch and receive
  - Show "Dispatch" button for Draft consignments where user is consignor
  - Show "Confirm Receipt" button for In Transit consignments where user is consignee
  - Disable buttons when wallet not connected or user not authorized
  - Handle button clicks: call respective API endpoints
  - Show loading state on button during transaction
  - Display success notification after transaction confirms
  - Refresh consignment list after successful action
  - _Requirements: 2.1, 2.5, 3.1, 3.5_

- [x] 8. Implement consignment detail view and tracking
  - _Requirements: 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8.1 Create ConsignmentDetails component
  - Create `ConsignmentDetails.tsx` component with route parameter for ARC
  - Fetch consignment data using `apiClient.getConsignment(arc)`
  - Fetch movement events using `apiClient.getConsignmentEvents(arc)`
  - Show loading spinner while fetching
  - Handle 404: display "Consignment not found" message
  - Display all consignment fields in organized sections
  - _Requirements: 4.3, 5.1, 5.3, 5.4_

- [x] 8.2 Implement QRCodeDisplay component
  - Install `qrcode.react` package
  - Create `QRCodeDisplay.tsx` component
  - Generate QR code encoding the ARC as plain text
  - Set QR code size to 200x200 pixels
  - Add "Download QR Code" button that saves image as PNG
  - Display ARC text below QR code
  - _Requirements: 5.2, 5.5_

- [x] 8.3 Create movement timeline component
  - Create `MovementTimeline.tsx` component
  - Display events in vertical timeline format
  - Show event type, timestamp, actor address, and transaction ID for each event
  - Format timestamps in readable format
  - Add icons for each event type (Created, Dispatched, Received)
  - Make transaction IDs clickable links to IOTA explorer
  - Show document hash for Dispatched events
  - Sort events chronologically (oldest first)
  - _Requirements: 4.3, 5.3_

- [x] 8.4 Add dispatch and receive actions to detail page
  - Show "Dispatch" button if status is Draft and user is consignor
  - Show "Confirm Receipt" button if status is In Transit and user is consignee
  - Implement dispatch action: call `apiClient.dispatchConsignment(arc, walletAddress)`
  - Implement receive action: call `apiClient.receiveConsignment(arc, walletAddress)`
  - Show loading state during transaction
  - Display success notification after confirmation
  - Refresh consignment data after successful action
  - Handle errors and display user-friendly messages
  - _Requirements: 2.1, 2.5, 3.1, 3.5_

- [x] 9. Add UI polish and error handling
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 9.1 Implement loading states and spinners
  - Create reusable `LoadingSpinner.tsx` component
  - Show spinner during wallet connection
  - Show spinner during form submission
  - Show spinner during data fetching
  - Show spinner on action buttons during transactions
  - Add skeleton loaders for dashboard and detail pages
  - _Requirements: 10.1_

- [x] 9.2 Create notification system
  - Install `react-hot-toast` or similar library
  - Create notification wrapper component
  - Implement success notifications (green) for: consignment created, dispatched, received
  - Implement error notifications (red) for: validation errors, blockchain errors, network errors
  - Display transaction IDs in success notifications
  - Auto-dismiss notifications after 5 seconds
  - Allow manual dismissal
  - _Requirements: 10.2, 10.3_

- [x] 9.3 Implement responsive design
  - Ensure all components work on desktop (1920px), tablet (768px), and mobile (375px)
  - Use TailwindCSS responsive utilities
  - Switch table to card view on mobile
  - Make forms single-column on mobile
  - Ensure buttons and inputs are touch-friendly (min 44px height)
  - Test navigation on mobile
  - _Requirements: 10.4_

- [x] 9.4 Add error boundaries and fallback UI
  - Create `ErrorBoundary.tsx` component
  - Wrap app in error boundary
  - Display friendly error message when component crashes
  - Add "Reload" button to recover
  - Log errors to console for debugging
  - _Requirements: 10.3_

- [x] 9.5 Write frontend component tests
  - Test WalletConnect connection flow
  - Test ConsignmentForm validation
  - Test Dashboard filtering
  - Test ConsignmentDetails data display
  - Test QRCodeDisplay rendering
  - Mock API calls for isolated testing
  - _Requirements: All frontend requirements_

- [x] 10. Deploy and prepare demo
  - _Requirements: All requirements_

- [x] 10.1 Deploy Move contracts to IOTA Testnet

- [x] 10.1 Deploy Move contracts to IOTA Testnet
  - Build Move contracts: `sui move build`
  - Deploy to testnet: `sui client publish`
  - Save package ID and object IDs
  - Verify deployment by calling view functions
  - Test contract functions via CLI
  - _Requirements: 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10.2 Configure backend with deployed contract addresses
  - Update `.env` with IOTA_RPC_URL (testnet endpoint)
  - Update `.env` with CONTRACT_ADDRESS (deployed package ID)
  - Update `.env` with CONSIGNMENT_MODULE and OPERATOR_MODULE addresses
  - Test backend API endpoints with Postman/curl
  - Verify blockchain integration works end-to-end
  - _Requirements: All backend requirements_

- [x] 10.3 Deploy backend API to cloud platform
  - Choose platform: Railway, Render, or Heroku
  - Create deployment configuration
  - Set environment variables in platform dashboard
  - Deploy backend
  - Test deployed API endpoints
  - Verify CORS configuration allows frontend origin
  - _Requirements: All backend requirements_

- [x] 10.4 Build and deploy frontend
  - Update `.env` with VITE_API_URL (deployed backend URL)
  - Build frontend: `npm run build`
  - Deploy to Vercel or Netlify
  - Configure environment variables
  - Test deployed frontend
  - Verify wallet connection works
  - Test complete user flow on deployed app
  - _Requirements: All frontend requirements_

- [x] 10.5 Create demo wallets and test data
  - Create 2-3 test wallets with IOTA Testnet tokens
  - Fund wallets from testnet faucet
  - Create 1-2 sample consignments for demo
  - Test complete flow: create → dispatch → receive
  - Verify all features work correctly
  - Take screenshots for documentation
  - _Requirements: All requirements_

- [x] 10.6 Write documentation and README
  - Write root README.md with project overview, architecture diagram, setup instructions
  - Document environment variables for backend and frontend
  - Write API documentation with endpoint descriptions and examples
  - Create demo script with step-by-step instructions
  - Document IOTA-specific features (Move contracts, notarization, events)
  - Add troubleshooting section
  - Include links to deployed app and contract explorer
  - _Requirements: All requirements_

- [ ]\* 10.7 Record demo video as backup
  - Record complete user flow (5-6 minutes)
  - Show wallet connection
  - Demonstrate consignment creation
  - Show ARC and QR code
  - Demonstrate dispatch
  - Switch wallet and confirm receipt
  - Show movement timeline
  - Explain blockchain benefits
  - _Requirements: All requirements_
