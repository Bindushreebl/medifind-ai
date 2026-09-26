# MediFind – Medicine Availability & Pharmacy Finder

A full-stack healthcare marketplace and medicine discovery application designed to eliminate wasted pharmacy trips by providing real-time local medicine stock levels, transparent counter price comparisons, pharmacist-verified equivalent alternatives, hold reservations, and restock notification alerts.

---

## 🚀 Key Features

1. **Live Medicine Search & Catalog**:
   - Search across 16+ essential medications by brand name, generic molecule, dosage form, or therapeutic category.
   - Filter by real-time availability (In Stock, Low Stock), OTC vs. Prescription (Rx), and price sorting.
2. **Real-Time Pharmacy Availability & Distance**:
   - Compare 8+ connected neighbourhood pharmacies with approximate distances in km, phone contacts, and operating hours.
3. **Price Comparison Engine**:
   - Side-by-side price comparison table highlighting the best counter price and calculated patient savings.
4. **Pharmacist-Verified Equivalent Options**:
   - Zero algorithmic guessing. Bioequivalent options are displayed only when explicitly confirmed by a licensed pharmacist with license number and clinical administration notes.
5. **Medicine Counter Hold Reservations**:
   - Reserve medication for counter pickup with date scheduling, phone contact, and instant tracking.
6. **Automated Restock Alerts**:
   - Subscribe to in-app restock notifications when an item is out of stock. Automatic notification dispatch occurs the moment a pharmacy replenishes inventory.
7. **Role-Based Portals**:
   - **Patient Dashboard**: Track reservations, monitor active restock alerts, view recent search logs, and see recommended pharmacies.
   - **Pharmacy Portal**: Manage shelf inventory, update quantities, edit prices, update reservation statuses, and view waiting patient restock requests with 1-click restock.
   - **Admin Console**: System metrics, Recharts visual analytics (search frequency, stock health, reservation trends), pharmacy verification toggle, and alternative approval.

---

## 🛡️ Pre-Seeded Demo Credentials

Use the **Role** dropdown in the top navbar or 1-click buttons on `/login` to test all roles immediately:

| Role | Email | Password | Access |
|---|---|---|---|
| **Patient (User)** | `user@medifind.com` | `user123` | Search, Reserve, Restock alerts, Patient Dashboard |
| **Pharmacy Staff** | `apollo@medifind.com` | `pharmacy123` | Shelf inventory, Reservations status, 1-Click Restock |
| **System Admin** | `admin@medifind.com` | `admin123` | Analytics charts, Pharmacy verification, Alternatives review |

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js (v18+)

### Development Server
```bash
# 1. Install dependencies
npm install

# 2. Run the application (starts full-stack server on port 3000)
npm run dev
```

### Production Build
```bash
# Build the client bundle
npm run build

# Start the production server
npm start
```

---

## ⚕️ Important Healthcare Notice
> *Medicine substitutions should only be made after consultation with a qualified doctor or pharmacist. MediFind is an availability discovery platform, not a diagnostic or prescribing service.*
