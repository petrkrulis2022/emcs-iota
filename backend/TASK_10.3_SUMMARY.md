# Task 10.3 Summary: Deploy Backend API to Cloud Platform

## Status: ✅ Deployment Ready

### What Has Been Completed ✅

1. **Deployment Configurations Created**
   - `railway.json` - Railway platform configuration
   - `render.yaml` - Render platform configuration
   - `Procfile` - Heroku process configuration

2. **Comprehensive Documentation**
   - `DEPLOYMENT_GUIDE.md` - Complete deployment guide for all 3 platforms
   - `DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment checklist
   - Includes troubleshooting and verification steps

3. **Platform Options Prepared**
   - **Railway** (Recommended) - Easiest deployment, automatic HTTPS
   - **Render** - Good free tier, auto-sleep after inactivity
   - **Heroku** - Classic option, requires paid plan

### Deployment Options

#### Option 1: Railway (Recommended)

**Pros:**
- Easiest deployment process
- Automatic HTTPS and custom domains
- Good free tier with no sleep
- Fast deployments

**Quick Deploy:**
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
railway variables set IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
railway variables set CONTRACT_PACKAGE_ID=YOUR_PACKAGE_ID
railway variables set OPERATOR_REGISTRY_ID=YOUR_REGISTRY_ID
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
railway domain  # Get your URL
```

#### Option 2: Render

**Pros:**
- Generous free tier
- Easy GitHub integration
- Automatic SSL

**Quick Deploy:**
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Configure:
   - Root Directory: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. Add environment variables
5. Deploy!

**Note:** Free tier sleeps after 15 min inactivity

#### Option 3: Heroku

**Pros:**
- Well-established platform
- Excellent documentation
- Easy scaling

**Quick Deploy:**
```bash
cd backend
heroku create emcs-backend
heroku config:set IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
heroku config:set CONTRACT_PACKAGE_ID=YOUR_PACKAGE_ID
heroku config:set OPERATOR_REGISTRY_ID=YOUR_REGISTRY_ID
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
git push heroku main
```

**Note:** Requires paid plan (free tier discontinued)

### Required Environment Variables

All platforms need these variables:

```env
NODE_ENV=production
PORT=3000
IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
CONTRACT_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
OPERATOR_REGISTRY_ID=0xYOUR_REGISTRY_ID_HERE
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Verification Steps

After deployment, verify:

#### 1. Health Check
```bash
curl https://your-backend-url.com/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T...",
  "service": "emcs-backend"
}
```

#### 2. API Info
```bash
curl https://your-backend-url.com/api
```

Should return API endpoint list.

#### 3. Test Create Consignment
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

### Deployment Checklist

- [ ] Platform account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] Deployment successful
- [ ] Health endpoint returns 200
- [ ] API endpoints accessible
- [ ] No errors in logs
- [ ] Deployment URL saved

### Common Issues & Solutions

**Build Failures**
- Ensure `npm run build` works locally
- Check all dependencies in `package.json`
- Verify Node version compatibility

**CORS Errors**
- Set `FRONTEND_URL` to exact frontend origin
- Include protocol (https://)
- No trailing slash
- Redeploy after changing

**Connection Errors**
- Verify `IOTA_RPC_URL` is correct
- Check platform allows outbound HTTPS
- Try alternative RPC endpoint

**500 Errors**
- Check logs for missing environment variables
- Verify `CONTRACT_PACKAGE_ID` is valid
- Ensure IOTA network is accessible

### Files Created

**Configuration Files:**
- `backend/railway.json` - Railway config
- `backend/render.yaml` - Render config
- `backend/Procfile` - Heroku config

**Documentation:**
- `backend/DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `backend/DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `backend/TASK_10.3_SUMMARY.md` - This summary

### What Requires User Action 🚨

The actual deployment requires user to:

1. **Choose a platform** (Railway, Render, or Heroku)
2. **Create account** on chosen platform
3. **Connect repository** or use CLI
4. **Set environment variables** with deployed contract addresses
5. **Deploy** and verify

See `DEPLOYMENT_GUIDE.md` for detailed instructions for each platform.

### Recommended Approach

For hackathon/demo:
1. Use **Railway** (easiest, no sleep)
2. Deploy via web UI (no CLI needed)
3. Set environment variables in dashboard
4. Get deployment URL
5. Test health endpoint
6. Save URL for frontend configuration

### Next Steps

After deployment:
1. ✅ Backend deployed to cloud
2. ✅ Deployment URL obtained
3. ⏭️ Update frontend `.env` with backend URL
4. ⏭️ Build and deploy frontend (Task 10.4)
5. ⏭️ Test end-to-end integration (Task 10.5)

### Additional Resources

- Railway: https://railway.app
- Render: https://render.com
- Heroku: https://heroku.com
- Deployment Guide: `backend/DEPLOYMENT_GUIDE.md`
- Configuration Guide: `backend/CONFIGURATION.md`
