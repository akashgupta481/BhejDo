# BhejDo API Contract

## Standard Response Format

All API endpoints return responses in the following format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Human readable message"
}
```

On error:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Authentication

All protected endpoints require the following header:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained via `/api/auth/login` or `/api/auth/signup`.

## User Roles

| Role | Value | Description |
|------|-------|-------------|
| Sender | `SENDER` | Creates shipments, tracks parcels |
| Traveler | `TRAVELER` | Accepts delivery jobs, earns money |
| Pickup Agent | `AGENT` | Handles local pickups, verifies OTP |
| Admin | `ADMIN` | Full platform management |

## Parcel Status Lifecycle

```
CREATED --> MATCHED --> PICKED_UP --> IN_TRANSIT --> DELIVERED
   |                                                    
   └--> CANCELLED (can cancel before PICKED_UP)
```

| Status | Description |
|--------|-------------|
| `CREATED` | Parcel created by sender, awaiting match |
| `MATCHED` | Traveler assigned to the parcel |
| `PICKED_UP` | Agent has picked up from sender |
| `IN_TRANSIT` | Traveler has the parcel, en route |
| `DELIVERED` | Parcel delivered to recipient |
| `CANCELLED` | Shipment cancelled |

## Core Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login, returns JWT
- `GET /api/auth/me` - Get current user profile (protected)

### Parcels
- `GET /api/parcels` - List user's parcels (protected)
- `POST /api/parcels` - Create new parcel (SENDER)
- `GET /api/parcels/:id` - Get parcel details (protected)
- `GET /api/parcels/:id/tracking` - Get tracking timeline

### Trips
- `GET /api/trips` - List trips (protected)
- `POST /api/trips` - Create trip (TRAVELER)
- `GET /api/trips/available` - Browse available trips

### Matching
- `GET /api/matching/find` - Find matches for a parcel
- `POST /api/matching/assign` - Assign traveler to parcel
- `POST /api/matching/accept` - Traveler accepts assignment

### Assignments
- `GET /api/assignments` - List assignments (protected)
- `POST /api/assignments/pickup` - Mark as picked up (AGENT)
- `POST /api/assignments/transit` - Mark in transit (TRAVELER)
- `POST /api/assignments/deliver` - Mark delivered (TRAVELER)

### Wallet
- `GET /api/wallet` - Get wallet balance (protected)
- `GET /api/wallet/earnings` - Get earnings history

### Notifications
- `GET /api/notifications` - List notifications (protected)
- `PUT /api/notifications/:id/read` - Mark as read

### Admin
- `GET /api/admin/users` - List all users (ADMIN)
- `GET /api/admin/parcels` - List all parcels (ADMIN)
- `GET /api/admin/stats` - Platform statistics (ADMIN)
