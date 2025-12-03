import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from root .env file
dotenv.config({ path: '../.env' });

let db = null;
let useMemory = false;

// Memory fallback storage
let memoryUsers = [];
let memoryTickets = [];
let memoryResaleHistory = [];

// Initialize database connection
export async function initDatabase() {
  console.log('🔄 Attempting MySQL connection...');
  
  try {
    // First connect without database to create it
    console.log('   Connecting to MySQL server...');
    const tempDb = await Promise.race([
      mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '@Nihar091',
        connectTimeout: 5000
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]);
    
    console.log('   Creating database if needed...');
    await tempDb.execute('CREATE DATABASE IF NOT EXISTS eventix_db');
    await tempDb.end();
    
    console.log('   Connecting to eventix_db...');
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '@Nihar091',
      database: process.env.DB_NAME || 'eventix_db',
      connectTimeout: 5000
    });
    
    console.log('   Creating tables...');
    await createTables();
    console.log('✅ MySQL database connected successfully');
    useMemory = false;
  } catch (error) {
    console.log('❌ MySQL connection failed, using memory storage:', error.message);
    useMemory = true;
  }
}

async function createTables() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const createTicketsTable = `
    CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mint_address VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      event_date VARCHAR(255),
      price DECIMAL(10,4) NOT NULL,
      original_price DECIMAL(10,4) NOT NULL,
      image VARCHAR(500),
      is_listed BOOLEAN DEFAULT FALSE,
      owner VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const createResaleHistoryTable = `
    CREATE TABLE IF NOT EXISTS resale_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ticket_id VARCHAR(255) NOT NULL,
      from_wallet VARCHAR(255) NOT NULL,
      to_wallet VARCHAR(255) NOT NULL,
      price DECIMAL(10,4) NOT NULL,
      resale_number INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await db.execute(createUsersTable);
  await db.execute(createTicketsTable);
  await db.execute(createResaleHistoryTable);
}

// User operations
export async function createUser(name, email, hashedPassword) {
  if (useMemory) {
    const user = { id: memoryUsers.length + 1, name, email, password: hashedPassword };
    memoryUsers.push(user);
    return user;
  }
  
  try {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return { id: result.insertId, name, email };
  } catch (error) {
    throw error;
  }
}

export async function findUserByEmail(email) {
  if (useMemory) {
    return memoryUsers.find(u => u.email === email);
  }
  
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  } catch (error) {
    return memoryUsers.find(u => u.email === email);
  }
}

// Ticket operations
export async function createTicket(ticketData) {
  if (useMemory) {
    memoryTickets.push(ticketData);
    return ticketData;
  }
  
  try {
    await db.execute(
      'INSERT INTO tickets (mint_address, name, description, event_date, price, original_price, image, is_listed, owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ticketData.mint, ticketData.name, ticketData.description, ticketData.eventDate, ticketData.price, ticketData.originalPrice, ticketData.image, ticketData.isListed, ticketData.owner]
    );
    return ticketData;
  } catch (error) {
    memoryTickets.push(ticketData);
    return ticketData;
  }
}

export async function getUserTickets(walletAddress) {
  if (useMemory) {
    return memoryTickets.filter(t => t.owner === walletAddress);
  }
  
  try {
    const [rows] = await db.execute('SELECT * FROM tickets WHERE owner = ?', [walletAddress]);
    return rows.map(row => ({
      id: row.mint_address,
      mint: row.mint_address,
      name: row.name,
      description: row.description,
      eventDate: row.event_date,
      price: parseFloat(row.price),
      originalPrice: parseFloat(row.original_price),
      image: row.image,
      isListed: row.is_listed,
      owner: row.owner,
      createdAt: row.created_at
    }));
  } catch (error) {
    return memoryTickets.filter(t => t.owner === walletAddress);
  }
}

export async function updateTicketListing(mintAddress, price, isListed) {
  if (useMemory) {
    const ticket = memoryTickets.find(t => t.mint === mintAddress);
    if (ticket) {
      ticket.price = price;
      ticket.isListed = isListed;
    }
    return;
  }
  
  try {
    await db.execute(
      'UPDATE tickets SET price = ?, is_listed = ? WHERE mint_address = ?',
      [price, isListed, mintAddress]
    );
  } catch (error) {
    const ticket = memoryTickets.find(t => t.mint === mintAddress);
    if (ticket) {
      ticket.price = price;
      ticket.isListed = isListed;
    }
  }
}

export async function updateTicketOwner(mintAddress, newOwner) {
  if (useMemory) {
    const ticket = memoryTickets.find(t => t.mint === mintAddress);
    if (ticket) {
      ticket.owner = newOwner;
      ticket.isListed = false;
    }
    return;
  }
  
  try {
    await db.execute(
      'UPDATE tickets SET owner = ?, is_listed = FALSE WHERE mint_address = ?',
      [newOwner, mintAddress]
    );
  } catch (error) {
    const ticket = memoryTickets.find(t => t.mint === mintAddress);
    if (ticket) {
      ticket.owner = newOwner;
      ticket.isListed = false;
    }
  }
}

export async function getMarketplaceTickets() {
  if (useMemory) {
    return memoryTickets.filter(t => t.isListed);
  }
  
  try {
    const [rows] = await db.execute('SELECT * FROM tickets WHERE is_listed = TRUE');
    return rows.map(row => ({
      id: row.mint_address,
      mint: row.mint_address,
      name: row.name,
      description: row.description,
      eventDate: row.event_date,
      price: parseFloat(row.price),
      originalPrice: parseFloat(row.original_price),
      image: row.image,
      isListed: row.is_listed,
      owner: row.owner,
      createdAt: row.created_at
    }));
  } catch (error) {
    return memoryTickets.filter(t => t.isListed);
  }
}

// Resale history operations
export async function addResaleHistory(historyData) {
  if (useMemory) {
    memoryResaleHistory.push(historyData);
    return;
  }
  
  try {
    await db.execute(
      'INSERT INTO resale_history (ticket_id, from_wallet, to_wallet, price, resale_number) VALUES (?, ?, ?, ?, ?)',
      [historyData.ticketId, historyData.fromWallet, historyData.toWallet, historyData.price, historyData.resaleNumber]
    );
  } catch (error) {
    memoryResaleHistory.push(historyData);
  }
}

export async function getResaleCount(ticketId) {
  if (useMemory) {
    return memoryResaleHistory.filter(h => h.ticketId === ticketId).length;
  }
  
  try {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM resale_history WHERE ticket_id = ?', [ticketId]);
    return rows[0].count;
  } catch (error) {
    return memoryResaleHistory.filter(h => h.ticketId === ticketId).length;
  }
}