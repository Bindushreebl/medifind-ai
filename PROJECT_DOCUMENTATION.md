# MediFind – Medicine Availability & Pharmacy Finder
## Project Documentation & Architecture Guide

### 1. Overview
MediFind is a healthcare marketplace and clinical information platform that helps patients check real-time medicine availability across local pharmacies, compare counter prices, view verified bioequivalent alternatives, request in-store pickup holds, and receive automated restock notifications.

### 2. Clinical Safety & Healthcare Disclaimer
- The application does NOT diagnose medical conditions, generate prescriptions, or recommend medication substitutions.
- Alternative options are strictly restricted to pharmacist-verified bioequivalent formulations.
- Prominent advisory across all medicine views:
  > *"Medicine substitutions should only be made after consultation with a qualified doctor or pharmacist."*

### 3. Architecture & Data Flow
```
┌────────────────────────────────────────────────────────┐
│               React + Vite Frontend (SPA)              │
│       Tailwind CSS · Lucide React · Recharts           │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API (Bearer JWT)
┌──────────────────────────▼─────────────────────────────┐
│             Node.js / Express Server (server.ts)        │
│       Vite Middleware in Dev · Static Assets in Prod   │
│   Auth & JWT · REST API Routes · Restock Engine        │
└──────────────────────────┬─────────────────────────────┘
                           │ Persistent Store
┌──────────────────────────▼─────────────────────────────┐
│                 Database (medifind_db.json)            │
│  Users · Pharmacies · Medicines · Inventory · Alts     │
│  Reservations · Restock Alerts · Search Logs · Notifs  │
└────────────────────────────────────────────────────────┘
```
In addition, the Python FastAPI codebase with SQLAlchemy models, Pydantic schemas, and requirements is organized under `/backend/app/` for modular migration to enterprise microservices.

### 4. Database Schema
1. **users**: `id`, `name`, `email`, `phone`, `password_hash`, `role` (USER, PHARMACY, ADMIN), `created_at`
2. **pharmacies**: `id`, `owner_id`, `name`, `address`, `latitude`, `longitude`, `phone`, `opening_time`, `closing_time`, `verified`, `rating`, `review_count`, `created_at`
3. **medicines**: `id`, `name`, `generic_name`, `category`, `dosage_form`, `strength`, `manufacturer`, `prescription_required`, `description`, `created_at`
4. **inventory**: `id`, `pharmacy_id`, `medicine_id`, `quantity`, `price`, `status` (`in_stock`, `low_stock`, `out_of_stock`), `last_updated`
5. **alternatives**: `id`, `medicine_id`, `alternative_medicine_id`, `pharmacist_name`, `pharmacist_license`, `verification_status` (`verified`, `pending`, `rejected`), `verification_date`, `notes`
6. **restock_alerts**: `id`, `user_id`, `medicine_id`, `pharmacy_id`, `status` (`active`, `notified`, `cancelled`), `created_at`
7. **reservations**: `id`, `user_id`, `pharmacy_id`, `medicine_id`, `quantity`, `total_price`, `status` (`pending`, `confirmed`, `ready_for_pickup`, `completed`, `cancelled`), `pickup_date`, `customer_phone`, `notes`, `created_at`
8. **search_history**: `id`, `user_id`, `medicine_id`, `query`, `searched_at`
9. **notifications**: `id`, `user_id`, `title`, `message`, `read`, `link`, `created_at`

### 5. API Endpoints
- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Medicines**: `GET /api/medicines`, `GET /api/medicines/:id`, `GET /api/medicines/search`, `GET /api/medicines/:id/availability`, `POST /api/medicines`
- **Pharmacies**: `GET /api/pharmacies`, `GET /api/pharmacies/:id`, `GET /api/pharmacies/nearby`
- **Inventory**: `GET /api/inventory`, `POST /api/inventory`, `DELETE /api/inventory/:id`
- **Alternatives**: `GET /api/medicines/:id/alternatives`, `POST /api/alternatives`, `PUT /api/alternatives/:id`
- **Restock Alerts**: `POST /api/restock-alerts`, `GET /api/restock-alerts`, `DELETE /api/restock-alerts/:id`
- **Reservations**: `POST /api/reservations`, `GET /api/reservations`, `PUT /api/reservations/:id/status`
- **Notifications**: `GET /api/notifications`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`
- **Admin**: `GET /api/admin/analytics`, `GET /api/admin/users`, `GET /api/admin/pharmacies`, `PUT /api/admin/pharmacies/:id/verify`, `GET /api/admin/alternatives`

### 6. Seed Accounts & Credentials
- **Patient User**: `user@medifind.com` / `user123`
- **Pharmacy Manager**: `apollo@medifind.com` / `pharmacy123`
- **Chief Admin Pharmacist**: `admin@medifind.com` / `admin123`
All accounts can be tested instantly using the **Role Switcher** in the top navigation bar or login screen.
