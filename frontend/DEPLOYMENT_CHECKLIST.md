# Frontend Deployment Checklist

## Pre-Deployment

- [ ] Backend deployed and URL available (Task 10.3)
- [ ] Frontend tested locally (`npm run dev`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Preview build works (`npm run preview`)
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors
- [ ] No console errors in browser

## Choose Platform

Select one:
- [ ] Vercel (Recommended for React/Vite)
- [ ] Netlify (Good alternative)

## Environment Configuration

- [ ] Create `.env.production` file
- [ ] Set `VITE_API_URL` to backend URL
- [ ] Set `VITE_IOTA_NETWORK` to `testnet`
- [ ] Test with production env locally

## Deployment Steps

### Vercel
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Deploy
- [ ] Get deployment URL

### Netlify
- [ ] Create Netlify account
- [ ] Connect GitHub repository
- [ ] Set base directory to `frontend`
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Deploy
- [ ] Get deployment URL

## Environment Variables in Platform

Set these in your deployment platform:
- [ ] `VITE_API_URL=https://your-backend-url.com`
- [ ] `VITE_IOTA_NETWORK=testnet`

## Post-Deployment Verification

### Basic Checks
- [ ] Frontend loads without errors
- [ ] No console errors
- [ ] Styling loads correctly
- [ ] Navigation works (all routes)
- [ ] Images and assets load

### Wallet Integration
- [ ] "Connect Wallet" button visible
- [ ] Wallet extension prompts for connection
- [ ] Wallet address displays after connection
- [ ] Can disconnect wallet

### API Integration
- [ ] Dashboard loads
- [ ] Can fetch consignments
- [ ] Can create consignment
- [ ] Can view consignment details
- [ ] No CORS errors in console

### Complete User Flow
- [ ] Connect wallet
- [ ] Create new consignment
- [ ] View consignment on dashboard
- [ ] View consignment details
- [ ] See QR code
- [ ] Dispatch consignment (if consignor)
- [ ] Receive consignment (if consignee)
- [ ] View movement history

## Backend CORS Update

After getting frontend URL:
- [ ] Update backend `FRONTEND_URL` environment variable
- [ ] Redeploy backend (if needed)
- [ ] Test CORS from frontend
- [ ] No CORS errors in browser console

## Performance Checks

- [ ] Page load time < 3 seconds
- [ ] No layout shift
- [ ] Smooth navigation
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browser

## Documentation

- [ ] Deployment URL saved
- [ ] Environment variables documented
- [ ] Deployment date recorded
- [ ] Platform credentials secured

## Deployment URL

Record your deployment URL here:
```
Frontend URL: https://___________________________
Deployed on: ___/___/2025
Platform: _______________
Backend URL: https://___________________________
```

## Troubleshooting Reference

If issues occur, see `DEPLOYMENT_GUIDE.md` troubleshooting section.

Common issues:
- Build failures → Check `npm run build` locally
- CORS errors → Update backend `FRONTEND_URL`
- Blank page → Check console for errors
- Wallet issues → Verify wallet extension installed

## Next Steps

- [ ] Frontend deployed successfully
- [ ] Backend CORS configured
- [ ] Complete flow tested
- [ ] Create demo wallets (Task 10.5)
- [ ] Prepare demo data (Task 10.5)
- [ ] Write documentation (Task 10.6)

## Notes

Add any deployment-specific notes or issues encountered:

```
[Your notes here]
```

## Continuous Deployment

- [ ] Automatic deployments enabled
- [ ] Preview deployments working
- [ ] Team members have access
- [ ] Deployment notifications configured

## Optional Enhancements

- [ ] Custom domain configured
- [ ] Analytics enabled
- [ ] Error tracking setup
- [ ] Performance monitoring enabled
- [ ] SEO optimized
