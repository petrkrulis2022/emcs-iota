# Start the EMCS Application

## Quick Start

Open **two separate terminal windows** and run these commands:

### Terminal 1: Start Backend

```bash
cd ~/EMCS\ -\ IOTA/backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
```

### Terminal 2: Start Frontend

```bash
cd ~/EMCS\ -\ IOTA/frontend
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Access the Application

Open your browser and go to: **http://localhost:5173**

## What You Can Test

### ✅ Available Now (Without Deployed Contracts):
- View the UI and layout
- Navigate between pages
- See the consignment form
- Test wallet connection UI (won't connect to real wallet yet)

### ⏳ Available After Contract Deployment:
- Create actual consignments on blockchain
- Connect real IOTA wallet
- View consignment details from blockchain
- Track consignment status changes

## Troubleshooting

### Backend won't start
```bash
cd ~/EMCS\ -\ IOTA/backend
npm install
npm run dev
```

### Frontend won't start
```bash
cd ~/EMCS\ -\ IOTA/frontend
npm install
npm run dev
```

### Port already in use
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

## Next Steps

After testing the UI:
1. Deploy contracts: `cd ~/EMCS\ -\ IOTA/contracts && ./deploy.sh`
2. Update backend/.env with contract addresses
3. Restart backend
4. Test full blockchain functionality

## Stop the Application

Press `Ctrl+C` in each terminal window to stop the services.
