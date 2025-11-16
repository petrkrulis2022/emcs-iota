# 🎬 EMCS on IOTA - Demo Video Screenplay (3-4 minutes)

## 🎯 Video Overview
**Total Duration:** 3-4 minutes  
**Purpose:** Showcase blockchain-powered EMCS system with real IOTA smart contracts  
**Target Audience:** Hackathon judges, blockchain developers, EU customs stakeholders

---

## 📝 Scene-by-Scene Breakdown

### **SCENE 1: Introduction (20 seconds)**
**Timing:** 0:00 - 0:20

**What to Show:**
- Landing page at `http://localhost:5173`
- Scroll through the page showing all sections

**What to Say:**
> "Welcome to EMCS on IOTA - a revolutionary blockchain solution for the European Union's Excise Movement Control System. This system tracks alcohol and tobacco products across EU borders using IOTA's feeless distributed ledger technology. Let me show you how it works."

**Actions:**
1. Open browser to `http://localhost:5173`
2. Slowly scroll through landing page sections:
   - Hero section with "Launch App" button
   - Key Features (Security, Real-time Verification, Zero Fees)
   - Why IOTA for EMCS comparison
   - Features for Operators and Officers
   - Technical stack

**Camera Focus:** Full screen capture, smooth scrolling

---

### **SCENE 2: Login as Excise Operator (15 seconds)**
**Timing:** 0:20 - 0:35

**What to Show:**
- Click "Launch Application" button
- Login page appears
- Enter credentials and login

**What to Say:**
> "Let's start by logging in as an excise operator - a brewery shipping beer across the EU."

**Actions:**
1. Click "Launch Application" button on landing page
2. Login page appears
3. Enter wallet address: `0x7b94ef0c29ea5a534e25754f87b8e8f6c95f4e2a3d1b6c9a8f3e5d2c1a0b9e8f`
4. Enter password: `demo`
5. Click "Login" button
6. Wait for redirect to operator dashboard

**Camera Focus:** Centered on login form

---

### **SCENE 3: Create New Consignment - Beer Shipment (40 seconds)**
**Timing:** 0:35 - 1:15

**What to Show:**
- Operator dashboard
- Navigate to "Create Consignment"
- Fill out the form with beer shipment details
- Show automatic excise duty calculation

**What to Say:**
> "As an operator, I'm creating a new electronic administrative document - or e-AD - for 10,000 liters of beer being shipped from Prague to Berlin. The system automatically calculates excise duty based on EU regulations. Watch as we save this to the IOTA blockchain."

**Actions:**
1. Click "Create Consignment" in navigation
2. Fill out form step-by-step (show each field clearly):
   - **Goods Type:** Beer
   - **Quantity:** 10000 (liters)
   - **Consignor Name:** Prague Brewery Ltd
   - **Consignor Address:** Brewery Street 123, Prague
   - **Consignee Name:** Berlin Beer Distributors GmbH
   - **Consignee Address:** Distribution Str 456, Berlin
   - **Origin Country:** Czech Republic
   - **Destination Country:** Germany
3. **PAUSE** to show the excise duty calculation (€1,900.00 displayed)
4. Click "Create Consignment"
5. Wait for wallet transaction modal to appear

**Camera Focus:** Zoom in on form fields, highlight the automatic excise duty calculation

---

### **SCENE 4: Blockchain Transaction - Wallet Signature (30 seconds)**
**Timing:** 1:15 - 1:45

**What to Show:**
- IOTA wallet connection prompt
- Transaction signature request
- Transaction confirmation
- Success message with ARC number

**What to Say:**
> "Now I'll sign this transaction with my IOTA wallet. This creates an NFT on the blockchain containing all the consignment details - immutable and tamper-proof. The transaction completes instantly with zero fees thanks to IOTA."

**Actions:**
1. Wallet modal appears
2. Click "Approve" on wallet transaction
3. Wait for blockchain confirmation (loading spinner)
4. Success notification appears with ARC number
5. Redirect to consignment detail page

**Camera Focus:** Centered on wallet modal, capture the entire transaction flow

**⚠️ Important:** Make sure you have IOTA testnet tokens in your wallet!

---

### **SCENE 5: View Consignment Details & PDF Export (20 seconds)**
**Timing:** 1:45 - 2:05

**What to Show:**
- Consignment detail page with all information
- NFT badge showing blockchain storage
- Transaction ID displayed
- Print PDF button

**What to Say:**
> "Here's our consignment detail page showing all information stored on-chain. Notice the NFT badge and blockchain transaction ID - proof this is real IOTA blockchain data, not a mock-up. We can also export this as a PDF for offline documentation."

**Actions:**
1. Show consignment detail page (should already be there)
2. Highlight the NFT badge (green checkmark)
3. Point to transaction ID
4. Show route visualization (Prague → Berlin)
5. Click "Print PDF" button
6. PDF opens in new tab - show it briefly
7. Close PDF tab

**Camera Focus:** Pan across the consignment details, zoom in on NFT badge and transaction ID

---

### **SCENE 6: Customs Officer Login (15 seconds)**
**Timing:** 2:05 - 2:20

**What to Show:**
- Navigate back to login page (open new tab or logout)
- Click "Customs Authority Login"
- Customs login page
- Login as officer

**What to Say:**
> "Now let's switch perspectives. A customs revenue officer wants to verify this shipment at the border."

**Actions:**
1. Open new browser tab to `http://localhost:5173`
2. Click "Launch Application"
3. On login page, click "Customs Authority Login" button (top right)
4. Customs login page appears
5. Enter wallet: `0xc8f9e3a2b1d4f7e6a5c9b2d8e1f4a7b6c3d9e2f5a8b1c4d7e9f2a5b8c1d4e7f9`
6. Enter password: `customs`
7. Click "Login"
8. Redirect to Customs Dashboard

**Camera Focus:** Show the transition between operator and customs views

---

### **SCENE 7: Customs Dashboard - View All Consignments (20 seconds)**
**Timing:** 2:20 - 2:40

**What to Show:**
- Customs dashboard with list of consignments
- Filter/search capabilities
- Click on the beer consignment we just created

**What to Say:**
> "The customs officer sees all consignments in their dashboard. They can filter by country, status, or goods type. Let's verify our Prague to Berlin beer shipment."

**Actions:**
1. Show customs dashboard with consignment list
2. Locate the consignment we just created (should be at top)
3. Highlight key information in the table:
   - ARC number
   - Origin: Czech Republic
   - Destination: Germany
   - Goods: Beer (10,000 liters)
   - Status badge
4. Click "View Details" button

**Camera Focus:** Full dashboard view, then zoom to our specific consignment row

---

### **SCENE 8: Officer Verification - Blockchain Proof (35 seconds)**
**Timing:** 2:40 - 3:15

**What to Show:**
- Consignment details modal
- "Verify as Officer" button
- Officer verification page opens
- Wallet signature for verification
- Visual NFT comparison
- Auto-redirect back to dashboard

**What to Say:**
> "The officer clicks 'Verify as Officer' which queries the IOTA blockchain. They sign the verification with their own wallet, creating an immutable audit trail. The system displays the NFT metadata visually - showing this consignment truly exists on-chain. After verification, they're automatically redirected back to the dashboard."

**Actions:**
1. Modal appears with consignment details
2. Scroll to "Officer Verification" section
3. Click "Verify as Officer" button
4. **New tab opens** to Officer Verification page
5. ARC field auto-populates
6. Click "Verify with Wallet" button
7. Wallet modal appears
8. Click "Approve" on wallet transaction
9. **PAUSE** to show the visual NFT card:
   - Purple/pink gradient card
   - Beer icon
   - Route: Prague → Berlin
   - Quantity: 10,000 L
   - Transaction ID
10. Show countdown timer (5... 4... 3...)
11. Auto-redirect back to customs dashboard

**Camera Focus:** Split between verification process and NFT visualization

**⚠️ Critical:** Make sure the NFT data matches what we created!

---

### **SCENE 9: Closing & Key Benefits (25 seconds)**
**Timing:** 3:15 - 3:40

**What to Show:**
- Back on customs dashboard
- Maybe click back to landing page
- Show technical stack section

**What to Say:**
> "And that's EMCS on IOTA! We've demonstrated real blockchain transactions with zero fees, instant verification, and complete transparency. This system combines IOTA smart contracts written in Move, NFT-based storage, and TypeScript full-stack development. Perfect for high-volume EU customs operations where every cent and every second counts."

**Actions:**
1. Show customs dashboard briefly
2. Navigate back to landing page (click logo or type URL)
3. Scroll to "Built with Cutting-Edge Technology" section
4. Highlight:
   - IOTA DLT
   - Smart Contracts (Move)
   - NFT Storage
   - TypeScript

**Camera Focus:** Professional closing shot of the landing page

---

### **SCENE 10: Final Call-to-Action (10 seconds)**
**Timing:** 3:40 - 3:50

**What to Show:**
- Landing page CTA section
- "Launch Application Now" button

**What to Say:**
> "Thank you for watching! All code is open source and deployed live on IOTA testnet. Ready to revolutionize EU customs with blockchain? Launch the application now."

**Actions:**
1. Scroll to final CTA section (blue gradient)
2. Hover over "Launch Application Now" button
3. Fade to black or end recording

**Camera Focus:** Centered on CTA button

---

## 🎬 Production Tips

### **Pre-Recording Checklist:**
- [ ] Both servers running (Backend: 3000, Frontend: 5173)
- [ ] Clear browser cache and cookies
- [ ] Close unnecessary browser tabs
- [ ] Have two wallets ready with testnet IOTA tokens:
  - Operator wallet: `0x7b94ef0c29ea5a534e25754f87b8e8f6c95f4e2a3d1b6c9a8f3e5d2c1a0b9e8f`
  - Customs wallet: `0xc8f9e3a2b1d4f7e6a5c9b2d8e1f4a7b6c3d9e2f5a8b1c4d7e9f2a5b8c1d4e7f9`
- [ ] Test the full flow once before recording
- [ ] Enable browser full-screen (F11)
- [ ] Set recording resolution to 1080p minimum
- [ ] Disable desktop notifications
- [ ] Practice your narration script

### **Recording Settings:**
- **Resolution:** 1920x1080 (1080p) or higher
- **Frame Rate:** 30 fps minimum
- **Audio:** Clear microphone, no background noise
- **Screen:** Record browser in full-screen mode
- **Cursor:** Enable cursor highlight in recording software

### **Narration Tips:**
- Speak clearly and at moderate pace
- Pause between scenes for easier editing
- Emphasize key terms: "blockchain," "NFT," "IOTA," "zero fees," "immutable"
- Sound enthusiastic but professional
- Don't worry about perfection - you can edit!

### **Common Issues & Solutions:**
- **Wallet not connecting:** Refresh page, check IOTA wallet extension
- **Transaction failing:** Ensure you have testnet tokens
- **Server crashed:** Restart both backend and frontend servers
- **NFT shows "Mock":** Check backend blockchain integration is working

### **Backup Plan:**
If blockchain integration fails during recording:
- The mock system will still work
- Mention: "In this demo, we're using simulated blockchain for reliability, but the production system uses real IOTA smart contracts"

---

## 📊 Key Talking Points to Emphasize

1. **Zero Transaction Fees** - IOTA's feeless nature makes this scalable
2. **Instant Verification** - No waiting for block confirmations
3. **Immutable Records** - NFT storage prevents tampering
4. **EU Compliance** - Real excise duty calculations per EU regulations
5. **Smart Contracts** - Written in Move language on IOTA
6. **Full Transparency** - Both operators and customs see the same data
7. **Wallet Signatures** - Creates audit trail for accountability
8. **Open Source** - All code available on GitHub

---

## 🎯 Success Metrics

Your demo video is successful if viewers can:
- ✅ Understand what EMCS is and why blockchain helps
- ✅ See real blockchain transactions happening
- ✅ Appreciate the dual perspective (operator + customs)
- ✅ Recognize the technical sophistication (IOTA, Move, NFTs)
- ✅ Understand the business value (fees, speed, trust)
- ✅ Feel excited about the solution

---

## 📝 Quick Reference: Demo Flow

```
Landing → Login (Operator) → Create Consignment (Beer) 
→ Wallet Sign → Success → View Details → Print PDF 
→ Logout → Login (Customs) → Dashboard → View Consignment 
→ Verify as Officer → Wallet Sign → NFT Display → Auto-Redirect 
→ Back to Landing → Done
```

**Total Actions:** ~35 clicks/interactions  
**Target Duration:** 3:30 - 3:50  
**Pace:** ~9 seconds per major action

---

Good luck with your recording! 🎥✨ Remember: confidence and clarity are more important than perfection!
