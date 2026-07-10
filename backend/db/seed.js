const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'bhejdo.db');

async function seed() {
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  // Check if already seeded
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) {
    console.log('Database already seeded. Skipping.');
    db.close();
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create demo users
  const senderId = uuidv4();
  const travelerId = uuidv4();
  const agentId = uuidv4();
  const adminId = uuidv4();
  const sender2Id = uuidv4();
  const traveler2Id = uuidv4();

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, address, city, verified, wallet_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(senderId, 'Rahul Sharma', 'sender@bhejdo.com', '+91-9876543210', passwordHash, 'SENDER', '123 MG Road, Koramangala', 'Bangalore', 1, 500.00);
  insertUser.run(travelerId, 'Priya Patel', 'traveler@bhejdo.com', '+91-9876543211', passwordHash, 'TRAVELER', '456 FC Road, Deccan', 'Pune', 1, 1200.00);
  insertUser.run(agentId, 'Vikram Singh', 'agent@bhejdo.com', '+91-9876543212', passwordHash, 'AGENT', '789 Connaught Place', 'Delhi', 1, 800.00);
  insertUser.run(adminId, 'Admin User', 'admin@bhejdo.com', '+91-9876543213', passwordHash, 'ADMIN', 'BhejDo HQ, HSR Layout', 'Bangalore', 1, 0.00);
  insertUser.run(sender2Id, 'Anita Desai', 'anita@example.com', '+91-9876543214', passwordHash, 'SENDER', '321 Park Street', 'Mumbai', 1, 250.00);
  insertUser.run(traveler2Id, 'Karan Mehta', 'karan@example.com', '+91-9876543215', passwordHash, 'TRAVELER', '654 Anna Salai', 'Chennai', 1, 900.00);

  // Create sample parcels
  const parcel1Id = uuidv4();
  const parcel2Id = uuidv4();
  const parcel3Id = uuidv4();
  const parcel4Id = uuidv4();

  const insertParcel = db.prepare(`
    INSERT INTO parcels (id, sender_id, receiver_name, receiver_phone, receiver_address, receiver_city, pickup_city, destination_city, weight, dimensions, description, insurance, estimated_price, status, otp_code, tracking_code, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertParcel.run(parcel1Id, senderId, 'Amit Kumar', '+91-9988776655', '42 Banjara Hills', 'Hyderabad', 'Bangalore', 'Hyderabad', 2.5, '30x20x15', 'Birthday gift - fragile items', 1, 350.00, 'IN_TRANSIT', '4521', 'BD-XK7M9P2A', '2026-07-05 10:30:00');
  insertParcel.run(parcel2Id, senderId, 'Sneha Reddy', '+91-9988776656', '15 Jubilee Hills', 'Hyderabad', 'Bangalore', 'Mumbai', 1.0, '20x15x10', 'Documents - important papers', 0, 200.00, 'CREATED', '7832', 'BD-LN4Q8R3B', '2026-07-07 14:00:00');
  insertParcel.run(parcel3Id, sender2Id, 'Ravi Shankar', '+91-9988776657', '88 MG Road', 'Bangalore', 'Mumbai', 'Bangalore', 5.0, '40x30x25', 'Electronics - laptop and accessories', 1, 600.00, 'MATCHED', '1956', 'BD-PW2T5V7C', '2026-07-06 09:15:00');
  insertParcel.run(parcel4Id, sender2Id, 'Deepa Nair', '+91-9988776658', '22 Marine Drive', 'Mumbai', 'Mumbai', 'Delhi', 3.0, '35x25x20', 'Clothing and accessories', 0, 280.00, 'DELIVERED', '6473', 'BD-HJ6Y1Z8D', '2026-07-01 11:45:00');

  // Create sample trips
  const trip1Id = uuidv4();
  const trip2Id = uuidv4();
  const trip3Id = uuidv4();
  const trip4Id = uuidv4();

  const insertTrip = db.prepare(`
    INSERT INTO trips (id, traveler_id, source_city, destination_city, travel_date, capacity, available_capacity, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTrip.run(trip1Id, travelerId, 'Bangalore', 'Hyderabad', '2026-07-10', 10.0, 5.0, 'ACTIVE', '2026-07-04 08:00:00');
  insertTrip.run(trip2Id, travelerId, 'Pune', 'Mumbai', '2026-07-12', 8.0, 8.0, 'ACTIVE', '2026-07-05 12:00:00');
  insertTrip.run(trip3Id, traveler2Id, 'Mumbai', 'Bangalore', '2026-07-11', 12.0, 7.0, 'ACTIVE', '2026-07-04 16:00:00');
  insertTrip.run(trip4Id, traveler2Id, 'Chennai', 'Delhi', '2026-07-15', 6.0, 6.0, 'ACTIVE', '2026-07-06 10:00:00');

  // Create sample assignments
  const assignment1Id = uuidv4();
  const assignment2Id = uuidv4();
  const assignment3Id = uuidv4();

  const insertAssignment = db.prepare(`
    INSERT INTO assignments (id, parcel_id, trip_id, traveler_id, agent_id, status, pickup_time, delivery_time, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAssignment.run(assignment1Id, parcel1Id, trip1Id, travelerId, agentId, 'IN_TRANSIT', '2026-07-05 12:00:00', null, '2026-07-05 11:00:00');
  insertAssignment.run(assignment2Id, parcel3Id, trip3Id, traveler2Id, agentId, 'ACCEPTED', null, null, '2026-07-06 10:00:00');
  insertAssignment.run(assignment3Id, parcel4Id, trip4Id, traveler2Id, agentId, 'DELIVERED', '2026-07-02 09:00:00', '2026-07-03 18:00:00', '2026-07-01 15:00:00');

  // Create sample transactions
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (id, user_id, type, amount, balance_after, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertTransaction.run(uuidv4(), senderId, 'CREDIT', 1000.00, 1000.00, 'Initial wallet top-up', '2026-07-01 10:00:00');
  insertTransaction.run(uuidv4(), senderId, 'DEBIT', 350.00, 650.00, 'Payment for parcel BD-1 to Hyderabad', '2026-07-05 10:30:00');
  insertTransaction.run(uuidv4(), senderId, 'DEBIT', 150.00, 500.00, 'Payment for parcel BD-4 to Delhi', '2026-07-01 11:45:00');
  insertTransaction.run(uuidv4(), travelerId, 'COMMISSION', 280.00, 280.00, 'Delivery commission for parcel to Hyderabad', '2026-07-05 12:00:00');
  insertTransaction.run(uuidv4(), travelerId, 'COMMISSION', 220.00, 500.00, 'Delivery commission for Mumbai route', '2026-07-03 18:00:00');
  insertTransaction.run(uuidv4(), travelerId, 'REWARD', 50.00, 550.00, 'Bonus: 5 deliveries milestone', '2026-07-04 10:00:00');
  insertTransaction.run(uuidv4(), travelerId, 'PAYOUT', 350.00, 1200.00, 'Bank transfer payout', '2026-07-06 09:00:00');
  insertTransaction.run(uuidv4(), agentId, 'COMMISSION', 100.00, 100.00, 'Pickup commission - Bangalore', '2026-07-05 12:00:00');
  insertTransaction.run(uuidv4(), agentId, 'COMMISSION', 80.00, 180.00, 'Pickup commission - Mumbai', '2026-07-02 09:00:00');
  insertTransaction.run(uuidv4(), agentId, 'PAYOUT', 180.00, 800.00, 'Bank transfer payout', '2026-07-07 09:00:00');

  // Create sample notifications
  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotification.run(uuidv4(), senderId, 'PARCEL_UPDATE', 'Parcel Picked Up', 'Your parcel to Hyderabad has been picked up by the traveler.', 1, '2026-07-05 12:00:00');
  insertNotification.run(uuidv4(), senderId, 'PARCEL_UPDATE', 'Parcel In Transit', 'Your parcel is now in transit to Hyderabad.', 0, '2026-07-05 14:00:00');
  insertNotification.run(uuidv4(), senderId, 'MATCH_FOUND', 'Traveler Found!', 'A traveler has been matched for your parcel to Mumbai.', 0, '2026-07-07 15:00:00');
  insertNotification.run(uuidv4(), travelerId, 'NEW_ASSIGNMENT', 'New Delivery Request', 'You have a new parcel delivery request for Bangalore to Hyderabad route.', 1, '2026-07-05 10:45:00');
  insertNotification.run(uuidv4(), travelerId, 'PAYMENT', 'Payment Received', 'You earned Rs 280 for delivering a parcel.', 0, '2026-07-05 12:05:00');
  insertNotification.run(uuidv4(), agentId, 'PICKUP_REQUEST', 'Pickup Scheduled', 'New pickup scheduled at 123 MG Road, Koramangala, Bangalore.', 1, '2026-07-05 11:30:00');
  insertNotification.run(uuidv4(), agentId, 'PAYMENT', 'Commission Credited', 'Rs 100 commission credited for pickup.', 0, '2026-07-05 12:05:00');

  // Create sample reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, parcel_id, reviewer_id, reviewee_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertReview.run(uuidv4(), parcel4Id, sender2Id, traveler2Id, 5, 'Excellent service! Parcel delivered safely and on time.', '2026-07-03 19:00:00');
  insertReview.run(uuidv4(), parcel4Id, sender2Id, agentId, 4, 'Good pickup experience, very professional.', '2026-07-03 19:05:00');

  console.log('Database seeded successfully with demo data.');
  db.close();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
