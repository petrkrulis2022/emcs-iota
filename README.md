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

- **Frontend**: [Add your deployed frontend URL]
- **Backend API**: [Add your deployed backend URL]
- **Smart Contracts**: [Add your package ID on Sui Explorer]

## ✨ Key Features

## Architecture

This is a monorepo containing three main components:

- **frontend/** - React + Vite + TypeScript web application
- **backend/** - Node.js + Express API server
- **contracts/** - IOTA Move smart contracts

- 🔐 **Blockchain Authentication** - Wallet-based secure authentication
- 📦 **Consignment Management** - Create and track excise goods shipments as NFTs
- 🔄 **Status Tracking** - Real-time updates (Draft → In Transit → Received)
- 📱 **QR Code Generation** - Scannable codes for quick access
- 🔗 **Immutable Audit Trail** - All movements permanently recorded on IOTA
- 📄 **Document Notarization** - SHA256 hashing with blockchain anchoring
- 🎯 **ARC Generation** - Unique Administrative Reference Codes (EU standard)
- 🌍 **Multi-Party Workflow** - Consignor and consignee authorization
- ⚡ **Feeless Transactions** - IOTA's unique architecture eliminates gas fees
- 🔍 **Transparent Verification** - Anyone can verify movements on blockchain

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │ Consignment  │  │   Tracking   │      │
│  │   Component  │  │     Form     │  │   Component  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTPS/REST
┌────────────────────────────▼──────────────────────────────────┐
│                Backend API (Node.js + Express)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Consignment  │  │  Notarization│  │     ARC      │       │
│  │   Routes     │  │   Service    │  │  Generator   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────────┬───────────────────────────────────┘
                             │ IOTA SDK
┌────────────────────────────▼───────────────────────────────────┐
│                    IOTA Blockchain (Testnet)                   │
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
- **Crypto** (built-in) - SHA256 hashing
- **CORS** - Cross-origin support
- **dotenv** - Environment configuration

### Blockchain
- **IOTA Testnet** - Blockchain network
- **Move** - Smart contract language
- **Sui Framework** - Move framework
- **NFT-based** - Consignment representation

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

- Unique identifier (ARC)
- Consignor and consignee addresses
- Goods type, quantity, and unit
- Origin and destination locations
- Status (Draft, In Transit, Received)
- Document hash (SHA256)
- Timestamps for all state transitions

### Movement Events

- Created event with consignor
- Dispatched event with document hash
- Received event with consignee signature

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

See [Backend Deployment Guide](backend/DEPLOYMENT_GUIDE.md)

**Recommended Platform**: Railway

```bash
cd backend
railway init
railway up
railway variables set IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
railway variables set CONTRACT_PACKAGE_ID=YOUR_PACKAGE_ID
railway variables set OPERATOR_REGISTRY_ID=YOUR_REGISTRY_ID
```

**Alternative Platforms**: Render, Heroku

### Frontend

See [Frontend Deployment Guide](frontend/DEPLOYMENT_GUIDE.md)

**Recommended Platform**: Vercel

```bash
cd frontend
vercel
vercel env add VITE_API_URL
vercel env add VITE_IOTA_NETWORK
```

**Alternative Platform**: Netlify

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

## 🙏 Acknowledgments

- **Moveathon Europe** - Hackathon organizers
- **IOTA Foundation** - Blockchain platform and support
- **Sui/Move** - Smart contract framework
- **EU EMCS** - Inspiration for the system design

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features]
- **Documentation**: See `/docs` folder for detailed guides
- **Demo**: [Add deployed app URL]

## 🎯 Roadmap

### Phase 1: MVP (Completed)
- [x] Smart contract development
- [x] Backend API implementation
- [x] Frontend user interface
- [x] Wallet integration
- [x] Basic consignment workflow
- [x] Deployment to testnet

### Phase 2: Enhancements (Future)
- [ ] IOTA Identity integration for operator verification
- [ ] Anomaly reporting (shortages, damages)
- [ ] Multi-signature approvals for high-value shipments
- [ ] Advanced filtering and search
- [ ] Export audit reports (PDF)
- [ ] Mobile app (React Native)

### Phase 3: Production (Future)
- [ ] IoT sensor integration (temperature, location)
- [ ] Automated customs notifications
- [ ] Analytics dashboard for authorities
- [ ] Integration with existing EMCS via API gateway
- [ ] Mainnet deployment
- [ ] Scalability optimizations

## 📊 Project Stats

- **Smart Contracts**: 2 Move modules
- **API Endpoints**: 7 REST endpoints
- **Frontend Components**: 15+ React components
- **Test Coverage**: [Add coverage percentage]
- **Lines of Code**: [Add LOC count]

## 🔗 Links

- **Live Demo**: [Add deployed frontend URL]
- **API Documentation**: [Add API docs URL]
- **Smart Contracts**: [Add Sui Explorer package URL]
- **GitHub Repository**: [Add GitHub URL]
- **Moveathon Europe**: [Add hackathon URL]

## 📖 Additional Resources

- [IOTA Documentation](https://docs.sui.io)
- [Move Language Guide](https://move-language.github.io/move/)
- [EU EMCS Information](https://ec.europa.eu/taxation_customs/business/excise-duties-alcohol-tobacco-energy/excise-movement-control-system_en)
- [Blockchain for Supply Chain](https://www.ibm.com/blockchain/supply-chain)

---

**Built with ❤️ for Moveathon Europe 2025**
