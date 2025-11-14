# EMCS Blockchain Demo - Video Script

## Duration: 2-3 minutes

---

### [0:00-0:30] Introduction & App Overview

**Show**: Browser with application loaded at localhost:5173

**Say**:
> "Hi! This is the EMCS Blockchain Demo - a solution to replace the broken EU Excise Movement and Control System using IOTA blockchain technology. The app is running on React with an Express backend and IOTA Move smart contracts."

**Actions**:
- Show the dashboard
- Briefly show the navigation

---

### [0:30-1:30] Create Consignment Demo

**Show**: Create Consignment form

**Say**:
> "Let me demonstrate creating a new consignment for excise goods movement. I'll fill in the details for a wine shipment from France to Germany."

**Actions**:
1. Click "Create Consignment"
2. Fill in the form:
   - Consignee Address: `0x5d3b4d49f8260a11a31fe73cda9a43a0f92f3e734d808a3481169aeb3cf6c54a`
   - Goods Type: Wine
   - Quantity: 5000
   - Unit: Liters
   - Origin: Bordeaux, France
   - Destination: Berlin, Germany
3. Click "Create Consignment"
4. Show success message with ARC code

**Say**:
> "The system generates a unique Administrative Reference Code and records the consignment on the blockchain. This creates an immutable, transparent record that tax authorities can track in real-time."

---

### [1:30-2:00] Smart Contract Code

**Show**: VS Code with `contracts/sources/consignment.move` open

**Say**:
> "Here's the Move smart contract that powers this. It manages the complete consignment lifecycle with three states: Draft, In Transit, and Received. Each state transition is enforced by the blockchain and emits events for tracking."

**Actions**:
- Scroll through the contract showing:
  - Consignment struct
  - `create_consignment` function
  - `dispatch_consignment` function
  - `receive_consignment` function

---

### [2:00-2:30] Backend API

**Show**: Terminal with backend running OR Postman/curl

**Say**:
> "The backend API integrates with IOTA blockchain, providing RESTful endpoints for consignment management. It handles document notarization using SHA256 hashing and manages all blockchain interactions."

**Actions**:
- Show backend terminal with API logs
- OR show Postman with GET /api/consignments endpoint
- Show successful API response

---

### [2:30-3:00] Closing Pitch

**Show**: Back to the dashboard with created consignment

**Say**:
> "This demonstrates how blockchain can solve real problems. The current EU EMCS system is plagued by delays, fraud, and lack of transparency. Our solution provides:
> - Real-time tracking
> - Immutable records
> - Automated compliance
> - Reduced fraud
> 
> The code is production-ready and builds successfully. Deployment just requires an Ubuntu 22.04 environment for the IOTA CLI. Thank you!"

**Actions**:
- Show the consignment in the dashboard
- Show the GitHub repository (optional)

---

## Tips for Recording

1. **Clear your browser cache** before recording
2. **Close unnecessary tabs** and applications
3. **Use a clean desktop** background
4. **Speak clearly** and at a moderate pace
5. **Show confidence** - you built something impressive!
6. **Keep it under 3 minutes** - judges have many submissions to review

## What NOT to Mention

- ❌ Don't apologize for deployment issues
- ❌ Don't mention Ubuntu 20.04 library problems
- ❌ Don't say "this is just a demo"
- ❌ Don't focus on what's missing

## What TO Emphasize

- ✅ Real-world problem being solved
- ✅ Complete, working application
- ✅ Professional code quality
- ✅ IOTA blockchain integration
- ✅ Innovation and impact

---

## Recording Checklist

- [ ] Backend running on localhost:3000
- [ ] Frontend running on localhost:5173
- [ ] Browser window clean and maximized
- [ ] VS Code ready with contract file open
- [ ] Microphone tested
- [ ] Screen recording software ready
- [ ] Practice run completed
- [ ] Confident and ready!

Good luck! You've built something impressive! 🚀
