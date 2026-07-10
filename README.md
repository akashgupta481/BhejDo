# BhejDo - Logistics Marketplace

A peer-to-peer logistics platform where Senders can ship parcels through Travelers already heading to the destination. Cost-effective, community-driven delivery.

## Features

- **Sender**: Create shipments, track parcels, manage deliveries
- **Traveler**: Browse available jobs, accept deliveries, earn money
- **Pickup Agent**: Handle local pickups, verify OTP, transfer to travelers
- **Admin**: Manage users, monitor parcels, view analytics
- **Matching Engine**: Auto-matches parcels with travelers by route & date
- **Wallet System**: Earnings, commissions, rewards, payouts
- **Real-time Tracking**: Track parcels with status timeline
- **Notifications**: In-app notifications for all events

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, SQLite
- **Auth**: JWT + BCrypt

## Quick Start

```bash
# Install all dependencies
npm install
npm run install:all

# Start both frontend and backend
npm start
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Sender | sender@bhejdo.com | password123 |
| Traveler | traveler@bhejdo.com | password123 |
| Agent | agent@bhejdo.com | password123 |
| Admin | admin@bhejdo.com | password123 |

## API Endpoints

- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- Parcels: `/api/parcels` (CRUD + tracking)
- Trips: `/api/trips` (CRUD + availability)
- Matching: `/api/matching/find`, `/assign`, `/accept`
- Assignments: `/api/assignments` (pickup, transit, deliver)
- Wallet: `/api/wallet`, `/api/wallet/earnings`
- Notifications: `/api/notifications`
- Admin: `/api/admin/users`, `/parcels`, `/stats`

## Project Structure

```
bhejdo/
├── frontend/          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── components/# Shared components
│   │   ├── context/   # Auth context
│   │   └── lib/       # API client, utils
│   └── package.json
├── backend/           # Node.js + Express + SQLite
│   ├── routes/        # API route handlers
│   ├── middleware/    # Auth & role middleware
│   ├── db/           # Schema, init, seed
│   └── package.json
├── package.json       # Root orchestration
└── README.md
```
