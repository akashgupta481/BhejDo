CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('SENDER', 'TRAVELER', 'AGENT', 'ADMIN')),
  address TEXT,
  city TEXT,
  verified INTEGER DEFAULT 0,
  wallet_balance REAL DEFAULT 0.0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS parcels (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  receiver_city TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  weight REAL,
  dimensions TEXT,
  description TEXT,
  photos TEXT,
  insurance INTEGER DEFAULT 0,
  estimated_price REAL,
  status TEXT NOT NULL DEFAULT 'CREATED' CHECK(status IN ('CREATED', 'MATCHED', 'PICKED_UP', 'IN_TRANSIT', 'REACHED', 'DELIVERED', 'CANCELLED')),
  otp_code TEXT,
  tracking_code TEXT UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  traveler_id TEXT NOT NULL,
  source_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  travel_date TEXT NOT NULL,
  capacity REAL NOT NULL,
  available_capacity REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (traveler_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  parcel_id TEXT NOT NULL,
  trip_id TEXT,
  traveler_id TEXT NOT NULL,
  agent_id TEXT,
  destination_agent_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'MATCHED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'REACHED', 'DELIVERED')),
  pickup_time TEXT,
  delivery_time TEXT,
  reached_time TEXT,
  agent_handed INTEGER DEFAULT 0,
  traveler_received INTEGER DEFAULT 0,
  agent_handed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (parcel_id) REFERENCES parcels(id),
  FOREIGN KEY (trip_id) REFERENCES trips(id),
  FOREIGN KEY (traveler_id) REFERENCES users(id),
  FOREIGN KEY (agent_id) REFERENCES users(id),
  FOREIGN KEY (destination_agent_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('CREDIT', 'DEBIT', 'REWARD', 'COMMISSION', 'PAYOUT')),
  amount REAL NOT NULL,
  balance_after REAL NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT,
  title TEXT NOT NULL,
  message TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  parcel_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  reviewee_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (parcel_id) REFERENCES parcels(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id),
  FOREIGN KEY (reviewee_id) REFERENCES users(id)
);
