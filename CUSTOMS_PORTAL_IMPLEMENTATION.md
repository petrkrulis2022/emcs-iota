# Customs Authority Portal Implementation

## Overview
Successfully implemented a complete Customs Authority Portal for Irish Revenue officers to monitor and oversee all EMCS consignments.

## Changes Made

### 1. ✅ Simplified Demo Credentials (Login.tsx)
**File:** `/frontend/src/pages/Login.tsx`

**Changes:**
- Removed specific wallet address and company name from demo box
- Changed to simple message: "**Password:** Any password works"
- Added "Customs Authority Login" button in top-right corner
- Button navigates to `/customs-login`

---

### 2. ✅ Created Customs Login Page (CustomsLogin.tsx - NEW)
**File:** `/frontend/src/pages/CustomsLogin.tsx`

**Features:**
- 🇮🇪 Irish Revenue branded (green/emerald theme)
- Dedicated customs authority login
- Validates specific customs wallet: `0xe35e7ff7ac48fe0fd80a0767bffdc18a3ecb5185debdefca9cf3e74377a00af3`
- "Back to Operator Login" button (top-left)
- Stores customs authority status in localStorage
- Demo credentials box with the customs wallet address

**Authentication Flow:**
1. Officer enters customs authority wallet address
2. Enters any password (mock authentication)
3. System validates it's the correct customs wallet
4. Redirects to `/customs-dashboard`

---

### 3. ✅ Created Customs Dashboard (CustomsDashboard.tsx - NEW)
**File:** `/frontend/src/pages/CustomsDashboard.tsx`

**Features:**

#### A. Header Section:
- 🇮🇪 Irish Revenue Customs Portal branding
- "EMCS Monitoring & Oversight System" tagline
- Logout button (returns to customs login)

#### B. Officer Information Panel:
- Officer portal identification
- Department: Customs Division
- Location: Castle House, Dublin 2
- Contact: +353 1 647 5000
- Wallet ID display (truncated)

#### C. Filter System:
**Direction Filter:**
- All Movements
- 🇮🇪 Exports (From Ireland) - Shows consignments with `origin` containing "Ireland"
- 🇮🇪 Imports (To Ireland) - Shows consignments with `destination` containing "Ireland"

**Status Filter:**
- All Statuses
- Active (Draft)
- In Transit
- Closed (Received)

**Date Filters:**
- From Date (date picker)
- To Date (date picker)

**Actions:**
- Shows count: "Showing X of Y consignments"
- "Clear Filters" button

#### D. Consignments Table:
**Columns:**
1. **ARC** - Administrative Reference Code (blue, monospace)
2. **Goods Type** - Wine, Beer, Spirits, etc.
3. **Route** - Shows:
   - From: [Origin]
   - To: [Destination]
4. **Quantity** - Amount and unit
5. **Status** - Badge (Draft/In Transit/Received)
6. **Created** - Timestamp (Irish format)
7. **Actions** - "View Details" button

**Table Features:**
- Hover effect on rows
- Color-coded status badges
- Responsive design
- Empty state when no results

#### E. PDF Print Modal:
**Triggered when:** Officer clicks "View Details"

**Features:**
- Full-screen modal with consignment details
- Uses `ConsignmentPrintPDF` component
- "Print PDF" button opens browser print dialog
- Close button (X) to dismiss modal
- Click outside to close
- When printed, shows only PDF content (all modals hidden)

**PDF Content Includes:**
- All consignment information
- Beer details and excise duty
- Czech customs office info
- Irish customs office info
- Packaging breakdown
- Blockchain verification

---

### 4. ✅ Updated App Routes (App.tsx)
**File:** `/frontend/src/App.tsx`

**New Routes:**
```tsx
/customs-login        → CustomsLogin page
/customs-dashboard    → CustomsDashboard (standalone, no Layout)
```

**Route Structure:**
- `/login` - Operator login
- `/customs-login` - Customs authority login
- `/customs-dashboard` - Customs portal (no shared layout)
- `/` - Protected operator routes (with Layout)

---

## User Flows

### Flow 1: Customs Officer Login
1. Navigate to http://localhost:5173/login
2. Click "Customs Authority Login" (top-right green button)
3. Enter wallet: `0xe35e7ff7ac48fe0fd80a0767bffdc18a3ecb5185debdefca9cf3e74377a00af3`
4. Enter any password
5. Click "Access Customs Portal"
6. Redirected to Customs Dashboard

### Flow 2: View All Consignments
1. After login, see full list of consignments
2. Table shows all movements in/out of Ireland
3. Each row has "View Details" button

### Flow 3: Filter Exports
1. Select "🇮🇪 Exports (From Ireland)" in Direction filter
2. System filters to show only consignments originating from Ireland
3. Table updates instantly

### Flow 4: Filter Imports
1. Select "🇮🇪 Imports (To Ireland)" in Direction filter
2. System filters to show only consignments destined for Ireland
3. Table updates instantly

### Flow 5: Filter by Status
1. Select "In Transit" from Status filter
2. See only consignments currently being transported
3. Combine with direction and date filters

### Flow 6: View & Print Consignment PDF
1. Click "View Details" on any consignment
2. Modal opens with full PDF content
3. Review all information
4. Click "Print PDF" button
5. Browser print dialog opens
6. Save as PDF or print to physical printer

### Flow 7: Logout
1. Click "Logout" button (top-right)
2. Returns to customs login page
3. localStorage cleared

---

## Mock Data Requirements

**Note:** The system currently shows actual consignments from the backend. To demonstrate the full customs portal with 10 mock consignments, you can:

1. Create consignments through the operator portal
2. Vary the origins/destinations:
   - Some with `origin: "Dublin, Ireland"`
   - Some with `destination: "Dublin, Ireland"`
   - Some between other countries
3. Use different goods types (Beer, Wine, Spirits)
4. Set different statuses (Draft, dispatch them, receive them)

This will populate the customs dashboard with diverse data for filtering demonstrations.

---

## Security Features

### Authentication:
- Customs wallet hardcoded: `0xe35e7ff7ac48fe0fd80a0767bffdc18a3ecb5185debdefca9cf3e74377a00af3`
- Any incorrect wallet shows error: "Invalid customs authority credentials"
- localStorage tracks customs authority status

### Access Control:
- Customs dashboard checks for valid customs authentication
- Redirects to customs login if not authenticated
- Separate from operator authentication system

### Data Access:
- Customs officers can view ALL consignments
- Operators can only see their own consignments
- Filtering system allows targeted oversight

---

## Technical Implementation

### State Management:
```typescript
const [directionFilter, setDirectionFilter] = useState<'all' | 'exports' | 'imports'>('all');
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in-transit' | 'closed'>('all');
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');
const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);
const [showPrintModal, setShowPrintModal] = useState(false);
```

### Filter Logic:
```typescript
const getFilteredConsignments = () => {
  let filtered = [...consignments];

  // Direction: Exports from Ireland
  if (directionFilter === 'exports') {
    filtered = filtered.filter(c => c.origin?.toLowerCase().includes('ireland'));
  }
  
  // Direction: Imports to Ireland
  if (directionFilter === 'imports') {
    filtered = filtered.filter(c => c.destination?.toLowerCase().includes('ireland'));
  }

  // Status filter
  if (statusFilter === 'active') filtered = filtered.filter(c => c.status === 'Draft');
  if (statusFilter === 'in-transit') filtered = filtered.filter(c => c.status === 'In Transit');
  if (statusFilter === 'closed') filtered = filtered.filter(c => c.status === 'Received');

  // Date range filter
  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    filtered = filtered.filter(c => new Date(c.createdAt) >= fromDate);
  }
  
  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59);
    filtered = filtered.filter(c => new Date(c.createdAt) <= toDate);
  }

  return filtered;
};
```

### Print Integration:
- Reuses `ConsignmentPrintPDF` component
- Modal with print trigger
- `print:hidden` classes hide UI elements
- `print:block` shows PDF content
- Native browser print dialog

---

## Styling & Branding

### Color Scheme:
**Customs Portal:**
- Primary: Emerald/Green (`emerald-600`, `green-600`)
- Represents Irish Revenue official branding
- Distinct from operator portal (blue/indigo)

**Operator Portal:**
- Primary: Blue/Indigo (`blue-600`, `indigo-600`)
- Represents commercial operators

### Visual Hierarchy:
- Large header with 🇮🇪 emoji and branding
- Officer info panel with avatar icon
- Clean white content area
- Shadow effects for depth
- Hover states for interactivity

---

## Files Created/Modified

### Created:
1. `/frontend/src/pages/CustomsLogin.tsx` (NEW)
2. `/frontend/src/pages/CustomsDashboard.tsx` (NEW)

### Modified:
1. `/frontend/src/pages/Login.tsx` - Added customs login button, simplified demo box
2. `/frontend/src/App.tsx` - Added customs routes

**Total:** 2 new files, 2 modified files

---

## Testing Checklist

✅ Customs login button appears on main login page  
✅ Customs login page loads with Irish Revenue branding  
✅ Wrong wallet address shows error  
✅ Correct wallet address allows login  
✅ Customs dashboard loads with officer info  
✅ All consignments visible in table  
✅ Exports filter shows Ireland-origin consignments  
✅ Imports filter shows Ireland-destination consignments  
✅ Status filters work (Draft/In Transit/Received)  
✅ Date filters work correctly  
✅ Clear filters button resets all filters  
✅ Count display updates with filters  
✅ "View Details" opens PDF modal  
✅ PDF shows all consignment data  
✅ Print button triggers browser print  
✅ Close modal button works  
✅ Logout returns to customs login  

---

## Next Steps

### 1. Deploy Smart Contracts
- Deploy to IOTA testnet
- Update contract addresses in backend

### 2. Create Demo Consignments
- Create 10 diverse consignments:
  - 3-4 exports from Ireland (Dublin → Prague, Dublin → Berlin)
  - 3-4 imports to Ireland (Prague → Dublin, Berlin → Dublin)
  - 2-3 other routes (Prague → Berlin)
- Mix of goods types (Beer, Wine, Spirits)
- Various statuses (Draft, In Transit, Received)
- Different dates

### 3. Demo Flow
1. Show operator login and create consignment
2. Show customs login
3. Demonstrate filter system:
   - Show all consignments
   - Filter to exports
   - Filter to imports
   - Filter by status
   - Filter by date
4. View and print consignment PDF
5. Show customs office contact info in PDF

---

## Status: ✅ COMPLETE

All requested features implemented:
1. ✅ Simplified demo credentials box
2. ✅ Customs Authority login button (top-right)
3. ✅ Customs login page with Irish Revenue branding
4. ✅ Customs dashboard with officer info
5. ✅ Filter system (exports/imports/status/dates)
6. ✅ Consignments table
7. ✅ PDF view and print functionality
8. ✅ All navigation and routing

**System is ready for smart contract deployment and final demo!** 🎉🇮🇪
