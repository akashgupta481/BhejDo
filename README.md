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

## Deployment

### Automatic Deployment & Versioning

This project uses GitHub Actions for automatic versioning and deployment:

**Automatic Version Bumping:**
- When you merge a PR to `main`, the version is automatically bumped based on:
  - **Major** (X.0.0): PR title/body contains "BREAKING CHANGE" or has `breaking`/`major` label
  - **Minor** (x.X.0): PR title contains "feat"/"feature" or has `feature`/`enhancement`/`minor` label
  - **Patch** (x.x.X): All other PRs (fixes, docs, chores)
- A new GitHub release is automatically created with changelog
- The deployment is triggered automatically

### Deploy to Vercel (Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/akashgupta481/BhejDo)

**Manual Setup:**
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

**GitHub Integration (Automatic):**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Import Project" → Connect your GitHub repo
3. Vercel will auto-detect the configuration from `vercel.json`
4. Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN`: Get from Vercel → Settings → Tokens
   - `VERCEL_ORG_ID`: Found in your Vercel team settings
   - `VERCEL_PROJECT_ID`: Found in your project settings on Vercel

### Deploy Backend (Choose One)

#### Option 1: Render (Recommended - Free Tier)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repo
4. Render will use `render.yaml` configuration
5. Add environment variables:
   - `JWT_SECRET`: Any secure random string
   - `NODE_ENV`: production

#### Option 2: Railway (Alternative - Free Tier)
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your BhejDo repository
4. Railway will use `railway.json` configuration
5. Add environment variables:
   - `JWT_SECRET`: Any secure random string
   - `NODE_ENV`: production
   - `PORT`: 3001 (Railway auto-assigns but we specify)

#### Option 3: Vercel Serverless (Requires refactoring)
Not recommended for SQLite-based apps as Vercel has read-only filesystem.

### Update Frontend API URL

After deploying the backend, update the frontend to point to your backend URL:

1. Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

2. Update `frontend/src/lib/api.ts` to use environment variable:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

3. Redeploy frontend to Vercel

### Production Checklist

- [ ] Backend deployed to Render/Railway
- [ ] Environment variables set (JWT_SECRET, NODE_ENV)
- [ ] Frontend API URL updated
- [ ] Frontend deployed to Vercel
- [ ] GitHub Actions secrets configured
- [ ] Test the live application
- [ ] Update CORS in backend to allow your Vercel domain

**CORS Update:** Edit `backend/index.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'https://your-app.vercel.app'  // Add your Vercel URL
  ],
  credentials: true
}));
```
