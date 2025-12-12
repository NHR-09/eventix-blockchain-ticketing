import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

let db = null;
let useMemory = false;

// Memory fallback storage
let memoryUsers = [];
let memoryTickets = [];
let memoryResaleHistory = [];

// Initialize MongoDB connection
export async function initDatabase() {
  console.log('🔄 Attempting MongoDB Atlas connection...');
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    db = client.db('eventix');
    
    console.log('✅ MongoDB Atlas connected successfully');
    useMemory = false;
  } catch (error) {
    console.log('❌ MongoDB connection failed, using memory storage:', error.message);
    useMemory = true;
  }
}

// User operations
export async function createUser(name, email, hashedPassword) {
  if (useMemory) {
    const user = { _id: memoryUsers.length + 1, name, email, password: hashedPassword };
    memoryUsers.push(user);
    return user;
  }
  
  try {
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    });
    return { _id: result.insertedId, name, email };
  } catch (error) {
    throw error;
  }
}

export async function findUserByEmail(email) {
  if (useMemory) {
    return memoryUsers.find(u => u.email === email);
  }
  
  try {
    return await db.collection('users').findOne({ email });
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
    await db.collection('tickets').insertOne({
      ...ticketData,
      createdAt: new Date()
    });
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
    const tickets = await db.collection('tickets').find({ owner: walletAddress }).toArray();
    return tickets.map(ticket => ({
      id: ticket.mint,
      mint: ticket.mint,
      name: ticket.name,
      description: ticket.description,
      eventDate: ticket.eventDate,
      price: parseFloat(ticket.price),
      originalPrice: parseFloat(ticket.originalPrice),
      image: ticket.image,
      isListed: ticket.isListed,
      owner: ticket.owner,
      createdAt: ticket.createdAt
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
    await db.collection('tickets').updateOne(
      { mint: mintAddress },
      { $set: { price, isListed } }
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
    await db.collection('tickets').updateOne(
      { mint: mintAddress },
      { $set: { owner: newOwner, isListed: false } }
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
    const tickets = await db.collection('tickets').find({ isListed: true }).toArray();
    return tickets.map(ticket => ({
      id: ticket.mint,
      mint: ticket.mint,
      name: ticket.name,
      description: ticket.description,
      eventDate: ticket.eventDate,
      price: parseFloat(ticket.price),
      originalPrice: parseFloat(ticket.originalPrice),
      image: ticket.image,
      isListed: ticket.isListed,
      owner: ticket.owner,
      createdAt: ticket.createdAt
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
    await db.collection('resaleHistory').insertOne({
      ...historyData,
      createdAt: new Date()
    });
  } catch (error) {
    memoryResaleHistory.push(historyData);
  }
}

export async function getResaleCount(ticketId) {
  if (useMemory) {
    return memoryResaleHistory.filter(h => h.ticketId === ticketId).length;
  }
  
  try {
    return await db.collection('resaleHistory').countDocuments({ ticketId });
  } catch (error) {
    return memoryResaleHistory.filter(h => h.ticketId === ticketId).length;
  }
}