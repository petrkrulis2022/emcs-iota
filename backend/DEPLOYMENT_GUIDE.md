# Backend Deployment Guide

## Overview

This guide covers deploying the EMCS backend API to cloud platforms. Three options are provided:
- **Railway** (Recommended - Easiest)
- **Render** (Good free tier)
- **Heroku** (Classic option)

## Prerequisites

Before deploying:
- ✅ Contracts deployed to IOTA Testnet (Task 10.1)
- ✅ Backend configured locally (Task 10.2)
- ✅ Package ID and Operator Registry ID available
- ✅ Backend tested locally (`npm run dev`)

## Option 1: Railway (Recommended)

### Why Railway?
- Easiest deployment process
- Automatic HTTPS
- Good free tier
- Fast deployments

### Deployment Steps

#### 1. Create Railway Account
Visit: https://railway.app and sign up with GitHub

#### 2. Install Railway CLI (Optional)
```bash
npm install -g @railway/cli
railway login
```

#### 3. Deploy via CLI
```bash
cd backend
railway init
railway up
```

#### 4. Set Environment Variables
```bash
railway variables set IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
railway variables set CONTRACT_PACKAGE_ID=YOUR_PACKAGE_ID
railway variables set OPERATOR_REGISTRY_ID=YOUR_REGISTRY_ID
railway variables set FRONTEND_URL=https://your-frontend-url.vercel.app
railway variables set NODE_ENV=production
```

#### 5. Deploy via Web UI (Alternative)
1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Connect your repository
4. Select `backend` as root directory
5. Add environment variables in Settings → Variables
6. Deploy!

#### 6. Get Deployment URL
```bash
railway domain
```

Or find it in the Railway dashboard.

### Configuration Files
- `railway.json` - Railway configuration (already created)


## Option 2: Render

### Why Render?
- Generous free tier
- Automatic SSL
- Easy GitHub integration
- Good for demos

### Deployment Steps

#### 1. Create Render Account
Visit: https://render.com and sign up with GitHub

#### 2. Create New Web Service
1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: emcs-backend
   - **Region**: Oregon (or closest to you)
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### 3. Add Environment Variables
In the Render dashboard, add:
```
NODE_ENV=production
PORT=3000
IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
CONTRACT_PACKAGE_ID=YOUR_PACKAGE_ID
OPERATOR_REGISTRY_ID=YOUR_REGISTRY_ID
FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### 4. Deploy
Click "Create Web Service" - Render will automatically deploy

#### 5. Get Deployment URL
Your service will be available at: `https://emcs-backend.onrender.com`

### Configuration Files
- `render.yaml` - Render configuration (already created)

### Notes
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Good for demos and testing


## Option 3: Heroku

### Why Heroku?
- Well-established platform
- Good documentation
- Easy scaling

### Deployment Steps

#### 1. Create Heroku Account
Visit: https://heroku.com and sign up

#### 2. Install Heroku CLI
```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 3. Login to Heroku
```bash
heroku login
```

#### 4. Create Heroku App
```bash
cd backend
heroku create emcs-backend
```

#### 5. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
heroku config:set CONTRACT_PACKAGE_ID=YOUR_PACKAGE_ID
heroku config:set OPERATOR_REGISTRY_ID=YOUR_REGISTRY_ID
heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### 6. Deploy
```bash
git push heroku main
```

Or if backend is in subdirectory:
```bash
git subtree push --prefix backend heroku main
```

#### 7. Open App
```bash
heroku open
```

### Configuration Files
- `Procfile` - Heroku process file (already created)

### Notes
- Free tier discontinued (requires paid plan)
- Reliable and well-documented
- Good for production deployments


## Post-Deployment Verification

### 1. Test Health Endpoint
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T...",
  "service": "emcs-backend"
}
```

### 2. Test API Info
```bash
curl https://your-backend-url.com/api
```

### 3. Test CORS
From your frontend, make a request to verify CORS is configured correctly.

### 4. Test Blockchain Integration
```bash
curl -X POST https://your-backend-url.com/api/consignments \
  -H "Content-Type: application/json" \
  -d '{
    "consignor": "0xYOUR_WALLET",
    "consignee": "0xRECIPIENT",
    "goodsType": "Wine",
    "quantity": 1000,
    "unit": "Liters",
    "origin": "Bordeaux",
    "destination": "Berlin"
  }'
```

## Environment Variables Checklist

Ensure all these are set in your deployment platform:

- [ ] `NODE_ENV=production`
- [ ] `PORT=3000` (or platform default)
- [ ] `IOTA_RPC_URL=https://fullnode.testnet.sui.io:443`
- [ ] `CONTRACT_PACKAGE_ID=0x...` (from deployment)
- [ ] `OPERATOR_REGISTRY_ID=0x...` (from deployment)
- [ ] `FRONTEND_URL=https://...` (your frontend URL)

## CORS Configuration

**Important**: Update `FRONTEND_URL` to match your deployed frontend URL.

For multiple origins (development + production):
```typescript
// In server.ts
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

## Troubleshooting

### "Application Error" or 500 errors
**Problem**: Backend crashes on startup

**Solutions**:
1. Check logs: `railway logs` or `heroku logs --tail`
2. Verify all environment variables are set
3. Ensure `CONTRACT_PACKAGE_ID` is valid
4. Check build completed successfully

### "Cannot connect to IOTA network"
**Problem**: Backend can't reach IOTA RPC

**Solutions**:
1. Verify `IOTA_RPC_URL` is correct
2. Check platform allows outbound HTTPS
3. Try alternative RPC endpoint

### CORS errors
**Problem**: Frontend can't call backend

**Solutions**:
1. Verify `FRONTEND_URL` matches frontend origin exactly
2. Include protocol (https://)
3. No trailing slash
4. Redeploy after changing environment variables

### Build failures
**Problem**: Deployment fails during build

**Solutions**:
1. Ensure `package.json` has `build` script
2. Check TypeScript compiles locally: `npm run build`
3. Verify all dependencies in `package.json`
4. Check Node version compatibility

## Monitoring and Logs

### Railway
```bash
railway logs
```

### Render
View logs in dashboard: https://dashboard.render.com

### Heroku
```bash
heroku logs --tail
```

## Scaling (Optional)

### Railway
Upgrade plan in dashboard for more resources

### Render
Upgrade to paid plan for:
- No sleep
- More CPU/RAM
- Custom domains

### Heroku
```bash
heroku ps:scale web=1
```

## Custom Domain (Optional)

### Railway
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records

### Render
1. Go to Settings → Custom Domain
2. Add domain
3. Update DNS records

### Heroku
```bash
heroku domains:add www.yourdomain.com
```

## Deployment Checklist

- [ ] Platform account created
- [ ] Repository connected (or CLI configured)
- [ ] Environment variables set
- [ ] Build command configured
- [ ] Start command configured
- [ ] Deployment successful
- [ ] Health endpoint returns 200
- [ ] API info endpoint works
- [ ] CORS configured for frontend
- [ ] Blockchain integration tested
- [ ] Logs show no errors
- [ ] Deployment URL saved for frontend config

## Next Steps

After successful deployment:
1. ✅ Backend deployed to cloud platform
2. ✅ Deployment URL obtained
3. ⏭️ Update frontend with backend URL (Task 10.4)
4. ⏭️ Deploy frontend (Task 10.4)
5. ⏭️ Test end-to-end flow (Task 10.5)

## Additional Resources

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Heroku Docs: https://devcenter.heroku.com
- Node.js Deployment Best Practices: https://nodejs.org/en/docs/guides/nodejs-docker-webapp
