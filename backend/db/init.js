const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'bhejdo.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function initDatabase() {
  const db = new DatabaseSync(DB_PATH);

  // Enable WAL mode for better performance
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  // Read and execute schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);

  console.log('Database initialized successfully at:', DB_PATH);
  db.close();
}

initDatabase();

module.exports = { DB_PATH };
