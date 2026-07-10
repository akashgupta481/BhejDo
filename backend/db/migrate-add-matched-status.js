const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'bhejdo.db');

function migrateAddMatchedStatus() {
  const db = new DatabaseSync(DB_PATH);

  console.log('Starting migration: Add MATCHED status to assignments table...');

  try {
    // Begin transaction
    db.exec('BEGIN TRANSACTION');

    // Create new assignments table with updated constraint
    db.exec(`
      CREATE TABLE assignments_new (
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
      )
    `);

    // Copy data from old table to new table
    db.exec(`
      INSERT INTO assignments_new
      SELECT * FROM assignments
    `);

    // Drop old table
    db.exec('DROP TABLE assignments');

    // Rename new table to original name
    db.exec('ALTER TABLE assignments_new RENAME TO assignments');

    // Commit transaction
    db.exec('COMMIT');

    console.log('✓ Migration completed successfully!');
    console.log('✓ MATCHED status is now allowed in assignments table');
  } catch (error) {
    // Rollback on error
    db.exec('ROLLBACK');
    console.error('✗ Migration failed:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

migrateAddMatchedStatus();
