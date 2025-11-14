# Backend Deployment Checklist

## Pre-Deployment

- [ ] Contracts deployed to IOTA Testnet
- [ ] Package ID and Operator Registry ID available
- [ ] Backend tested locally (`npm run dev`)
- [ ] All tests passing (`npm test`)
- [ ] Environment variables documented
- [ ] Build succeeds locally (`npm run build`)

## Choose Platform

Select one:
- [ ] Railway (Recommended for ease)
- [ ] Render (Good free tier)
- [ ] Heroku (Requires paid plan)

## Deployment Steps

### Railway
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Add environment variables
- [ ] Deploy
- [ ] Get deployment URL

### Render
- [ ] Create Render account
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Configure build/start commands
- [ ] Add environment variables
- [ ] Deploy
- [ ] Get deployment URL

### Heroku
- [ ] Create Heroku account
- [ ] Install Heroku CLI
- [ ] Create Heroku app
- [ ] Set environment variables
- [ ] Deploy via git
- [ ] Get deployment URL

## Environment Variables

Set these in your platform:
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `IOTA_RPC_URL=https://fullnode.testnet.sui.io:443`
- [ ] `CONTRACT_PACKAGE_ID=0x...`
- [ ] `OPERATOR_REGISTRY_ID=0x...`
- [ ] `FRONTEND_URL=https://...` (will update after frontend deployment)

## Post-Deployment Verification

- [ ] Health endpoint returns 200: `curl https://your-url.com/health`
- [ ] API info endpoint works: `curl https://your-url.com/api`
- [ ] No errors in deployment logs
- [ ] Backend can connect to IOTA network
- [ ] Environment variables loaded correctly

## CORS Configuration

- [ ] `FRONTEND_URL` set correctly
- [ ] Test CORS from frontend (after frontend deployment)
- [ ] No CORS errors in browser console

## Documentation

- [ ] Deployment URL saved
- [ ] Environment variables documented
- [ ] Access credentials secured
- [ ] Deployment date recorded

## Next Steps

- [ ] Update frontend `.env` with backend URL
- [ ] Deploy frontend (Task 10.4)
- [ ] Test end-to-end integration
- [ ] Create demo wallets (Task 10.5)

## Troubleshooting Reference

If issues occur, see `DEPLOYMENT_GUIDE.md` troubleshooting section.

Common issues:
- Build failures → Check `npm run build` locally
- CORS errors → Verify `FRONTEND_URL` matches exactly
- 500 errors → Check logs for missing env vars
- Connection errors → Verify `IOTA_RPC_URL` is correct

## Deployment URL

Record your deployment URL here:
```
Backend URL: https://___________________________
Deployed on: ___/___/2025
Platform: _______________
```

## Notes

Add any deployment-specific notes or issues encountered:

```
[Your notes here]
```
