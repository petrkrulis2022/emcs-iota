# Frontend Deployment Guide

## Overview

This guide covers deploying the EMCS frontend to cloud platforms. Two options are provided:
- **Vercel** (Recommended - Best for React/Vite)
- **Netlify** (Good alternative)

## Prerequisites

Before deploying:
- ✅ Backend deployed and URL available (Task 10.3)
- ✅ Frontend tested locally (`npm run dev`)
- ✅ Build succeeds locally (`npm run build`)

## Option 1: Vercel (Recommended)

### Why Vercel?
- Built for React and Vite
- Automatic deployments from GitHub
- Excellent performance
- Free tier with custom domains
- Automatic HTTPS

### Deployment Steps

#### 1. Create Vercel Account
Visit: https://vercel.com and sign up with GitHub

#### 2. Install Vercel CLI (Optional)
```bash
npm install -g vercel
vercel login
```

#### 3. Deploy via CLI
```bash
cd frontend
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **emcs-frontend**
- Directory? **./frontend** (or just press Enter if already in frontend dir)
- Override settings? **N**

#### 4. Set Environment Variables
```bash
vercel env add VITE_API_URL
# Enter: https://your-backend-url.com

vercel env add VITE_IOTA_NETWORK
# Enter: testnet
```

Or set in Vercel dashboard:
1. Go to project settings
2. Environment Variables
3. Add:
   - `VITE_API_URL` = `https://your-backend-url.com`
   - `VITE_IOTA_NETWORK` = `testnet`

#### 5. Deploy via Web UI (Alternative)
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
4. Add environment variables
5. Deploy!

#### 6. Get Deployment URL
Your app will be available at: `https://emcs-frontend.vercel.app`

Or custom domain: `https://your-domain.com`

### Configuration Files
- `vercel.json` - Vercel configuration (already created)


## Option 2: Netlify

### Why Netlify?
- Easy deployment process
- Good free tier
- Automatic deployments
- Built-in forms and functions

### Deployment Steps

#### 1. Create Netlify Account
Visit: https://netlify.com and sign up with GitHub

#### 2. Install Netlify CLI (Optional)
```bash
npm install -g netlify-cli
netlify login
```

#### 3. Deploy via CLI
```bash
cd frontend
netlify init
```

Follow the prompts:
- Create & configure a new site
- Team: Select your team
- Site name: **emcs-frontend**
- Build command: `npm run build`
- Publish directory: `dist`

Then deploy:
```bash
netlify deploy --prod
```

#### 4. Set Environment Variables
```bash
netlify env:set VITE_API_URL https://your-backend-url.com
netlify env:set VITE_IOTA_NETWORK testnet
```

Or set in Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add:
   - `VITE_API_URL` = `https://your-backend-url.com`
   - `VITE_IOTA_NETWORK` = `testnet`

#### 5. Deploy via Web UI (Alternative)
1. Go to https://app.netlify.com/start
2. Connect to Git provider (GitHub)
3. Select your repository
4. Configure:
   - **Base directory**: frontend
   - **Build command**: `npm run build`
   - **Publish directory**: frontend/dist
5. Add environment variables
6. Deploy!

#### 6. Get Deployment URL
Your app will be available at: `https://emcs-frontend.netlify.app`

### Configuration Files
- `netlify.toml` - Netlify configuration (already created)


## Configuration Steps

### Step 1: Update Environment Variables

Create `frontend/.env.production`:

```env
# Backend API URL (from Task 10.3)
VITE_API_URL=https://your-backend-url.com

# IOTA Network
VITE_IOTA_NETWORK=testnet
```

**Important**: Replace `your-backend-url.com` with your actual backend URL from Task 10.3.

### Step 2: Test Build Locally

```bash
cd frontend
npm install
npm run build
npm run preview
```

Visit `http://localhost:4173` to test the production build.

### Step 3: Update Backend CORS

After getting your frontend URL, update backend environment variables:

```bash
# On Railway
railway variables set FRONTEND_URL=https://your-frontend.vercel.app

# On Render
# Update in dashboard: Settings → Environment

# On Heroku
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
```

## Post-Deployment Verification

### 1. Test Frontend Loads
Visit your deployment URL and verify:
- [ ] Page loads without errors
- [ ] No console errors
- [ ] Styling loads correctly
- [ ] Navigation works

### 2. Test Wallet Connection
- [ ] Click "Connect Wallet" button
- [ ] Wallet extension prompts for connection
- [ ] Wallet address displays after connection

### 3. Test API Integration
- [ ] Dashboard loads
- [ ] Can create consignment
- [ ] Can view consignment details
- [ ] No CORS errors in console

### 4. Test Complete Flow
1. Connect wallet
2. Create consignment
3. View on dashboard
4. Dispatch consignment
5. Receive consignment
6. View movement history

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://emcs-backend.railway.app` |
| `VITE_IOTA_NETWORK` | IOTA network | `testnet` |

## Troubleshooting

### Build Failures

**Problem**: Build fails with TypeScript errors

**Solutions**:
1. Run `npm run build` locally to see errors
2. Fix TypeScript errors
3. Ensure all dependencies installed
4. Check Node version (should be 18+)

### "Failed to fetch" errors

**Problem**: Frontend can't reach backend

**Solutions**:
1. Verify `VITE_API_URL` is correct
2. Check backend is running: `curl https://backend-url/health`
3. Verify backend CORS allows frontend origin
4. Check browser console for exact error

### CORS Errors

**Problem**: "Access-Control-Allow-Origin" error

**Solutions**:
1. Update backend `FRONTEND_URL` to match frontend URL exactly
2. Include protocol (https://)
3. No trailing slash
4. Redeploy backend after changing

### Wallet Connection Issues

**Problem**: Wallet doesn't connect

**Solutions**:
1. Ensure wallet extension installed
2. Check wallet is on testnet
3. Try different browser
4. Check console for errors

### Blank Page After Deployment

**Problem**: Deployment succeeds but page is blank

**Solutions**:
1. Check browser console for errors
2. Verify build output in `dist/` folder
3. Check routing configuration
4. Ensure `index.html` in dist root

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Netlify
1. Go to Domain Settings → Add custom domain
2. Update DNS records:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

## Performance Optimization

### Enable Compression
Both Vercel and Netlify automatically enable gzip/brotli compression.

### Cache Headers
Static assets are cached automatically (configured in `vercel.json` / `netlify.toml`).

### Lighthouse Score
Run Lighthouse audit:
```bash
npm install -g lighthouse
lighthouse https://your-frontend-url.com
```

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## Monitoring

### Vercel Analytics
Enable in project settings for:
- Page views
- Performance metrics
- Error tracking

### Netlify Analytics
Available on paid plans for:
- Traffic analysis
- Performance monitoring
- Error tracking

## Deployment Checklist

- [ ] Backend URL obtained from Task 10.3
- [ ] Environment variables configured
- [ ] Build succeeds locally
- [ ] Platform account created
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables set in platform
- [ ] Deployment successful
- [ ] Frontend loads without errors
- [ ] Wallet connection works
- [ ] API calls succeed
- [ ] No CORS errors
- [ ] Backend CORS updated with frontend URL
- [ ] Complete user flow tested

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:

### Automatic Deployments
- Push to `main` branch → Automatic production deployment
- Push to other branches → Preview deployments

### Preview Deployments
- Every pull request gets a unique preview URL
- Test changes before merging
- Share with team for review

## Rollback

### Vercel
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." → Promote to Production

### Netlify
1. Go to Deploys
2. Find previous deployment
3. Click "Publish deploy"

## Next Steps

After successful deployment:
1. ✅ Frontend deployed to cloud
2. ✅ Frontend URL obtained
3. ✅ Backend CORS updated
4. ⏭️ Create demo wallets and test data (Task 10.5)
5. ⏭️ Test complete end-to-end flow
6. ⏭️ Prepare demo presentation

## Additional Resources

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- React Deployment: https://react.dev/learn/start-a-new-react-project#deploying-to-production
