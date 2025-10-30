const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'eventix_db'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Create users table if not exists
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createUsersTable, (err) => {
  if (err) console.error('Error creating users table:', err);
  else console.log('Users table ready');
});

module.exports = { db, bcrypt };