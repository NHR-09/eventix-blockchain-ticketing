import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const app = express();
let PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
let tickets = [];
let userTickets = [];

// Available ticket types
const TICKET_TYPES = {
  'concert-vip': {
    name: 'VIP Concert Ticket',
    description: 'Indie Night Concert - VIP Access',
    eventDate: 'Dec 25, 2025',
    price: 0.1,
    seat: 'VIP-001'
  },
  'music-fest': {
    name: 'Music Fest 2025',
    description: 'Annual Music Festival',
    eventDate: 'Jan 15, 2025',
    price: 0.08,
    seat: 'GA-001'
  },
  'standup-night': {
    name: 'Standup Night',
    description: 'Comedy Show with Top Comedians',
    eventDate: 'Feb 10, 2025',
    price: 0.05,
    seat: 'COM-001'
  },
  'art-expo': {
    name: 'Art Expo',
    description: 'Modern Art Exhibition',
    eventDate: 'Mar 5, 2025',
    price: 0.03,
    seat: 'ART-001'
  },
  'sports-mania': {
    name: 'Sports Mania',
    description: 'Multi-Sport Championship',
    eventDate: 'Apr 20, 2025',
    price: 0.12,
    seat: 'SPT-001'
  }
};

// Buy ticket endpoint
app.post('/buy-ticket', async (req, res) => {
  try {
    console.log('🎫 Processing ticket purchase request...');
    const { ticketType } = req.body;
    console.log(`   Ticket type requested: ${ticketType}`);
    
    const ticketInfo = TICKET_TYPES[ticketType];
    
    if (!ticketInfo) {
      console.log(`   ❌ Invalid ticket type: ${ticketType}`);
      return res.json({ success: false, error: 'Invalid ticket type' });
    }

    console.log(`   ✅ Valid ticket: ${ticketInfo.name} - ${ticketInfo.price} SOL`);
    console.log(`   🔄 Calling minting service...`);
    
    // Call minting service
    const mintResult = await mintTicket(ticketInfo);
    console.log(`   📝 Mint result:`, mintResult);
    
    if (mintResult.success) {
      // Store ticket info
      const ticket = {
        id: mintResult.mintAddress,
        mint: mintResult.mintAddress,
        name: ticketInfo.name,
        description: ticketInfo.description,
        eventDate: ticketInfo.eventDate,
        price: ticketInfo.price,
        originalPrice: ticketInfo.price,
        isListed: false,
        owner: 'customer',
        createdAt: new Date().toISOString()
      };
      
      userTickets.push(ticket);
      console.log(`   ✅ Ticket stored! Total tickets: ${userTickets.length}`);
      
      res.json({
        success: true,
        mintAddress: mintResult.mintAddress,
        transaction: mintResult.transaction,
        ticket: ticket
      });
    } else {
      console.log(`   ❌ Minting failed: ${mintResult.error}`);
      res.json({ success: false, error: mintResult.error });
    }
  } catch (error) {
    console.error('❌ Buy ticket error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// List ticket for sale
app.post('/list-ticket', async (req, res) => {
  try {
    const { ticketId, price } = req.body;
    
    // Find ticket
    const ticket = userTickets.find(t => t.mint === ticketId);
    if (!ticket) {
      return res.json({ success: false, error: 'Ticket not found' });
    }

    // Call listing service
    const listResult = await listTicketForSale(ticketId, price);
    
    if (listResult.success) {
      ticket.isListed = true;
      ticket.price = price;
      
      res.json({ success: true, transaction: listResult.transaction });
    } else {
      res.json({ success: false, error: listResult.error });
    }
  } catch (error) {
    console.error('List ticket error:', error);
    res.json({ success: false, error: error.message });
  }
});

// Get user's tickets
app.get('/my-tickets', (req, res) => {
  console.log('🎫 Loading user tickets...');
  console.log(`   ✅ User has ${userTickets.length} tickets`);
  userTickets.forEach((ticket, i) => {
    console.log(`   ${i+1}. ${ticket.name} - ${ticket.mint.slice(0,8)}... - ${ticket.isListed ? 'Listed' : 'Not Listed'}`);
  });
  res.json(userTickets);
});

// Get available tickets
app.get('/available-tickets', (req, res) => {
  console.log('🎫 Loading available tickets...');
  const available = Object.entries(TICKET_TYPES).map(([id, info]) => ({
    id,
    ...info
  }));
  console.log(`   ✅ Returning ${available.length} available ticket types`);
  res.json(available);
});

// Mint ticket function - calls minting service
async function mintTicket(ticketInfo) {
  try {
    console.log(`🔄 Calling minting service for: ${ticketInfo.name}`);
    
    const response = await fetch('http://localhost:3002/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: ticketInfo.name,
        description: ticketInfo.description,
        eventDate: ticketInfo.eventDate,
        seat: ticketInfo.seat,
        price: ticketInfo.price
      })
    });
    
    const result = await response.json();
    console.log(`📝 Minting service response:`, result);
    
    return result;
  } catch (error) {
    console.error(`❌ Minting service error:`, error.message);
    return { success: false, error: error.message };
  }
}

// List ticket function - calls minting service
async function listTicketForSale(mintAddress, price) {
  try {
    console.log(`🔄 Calling listing service for: ${mintAddress} at ${price} SOL`);
    
    const response = await fetch('http://localhost:3002/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mintAddress, price })
    });
    
    const result = await response.json();
    console.log(`📝 Listing service response:`, result);
    
    return result;
  } catch (error) {
    console.error(`❌ Listing service error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Buy ticket from marketplace
app.post('/buy-from-marketplace', async (req, res) => {
  try {
    console.log('🛒 Processing marketplace purchase...');
    const { ticketId, buyerWallet } = req.body;
    console.log(`   Ticket: ${ticketId}, Buyer: ${buyerWallet}`);
    
    // Find the listed ticket
    const ticket = userTickets.find(t => t.mint === ticketId && t.isListed);
    if (!ticket) {
      console.log(`   ❌ Ticket not found or not listed: ${ticketId}`);
      return res.json({ success: false, error: 'Ticket not available' });
    }
    
    console.log(`   ✅ Found ticket: ${ticket.name} - ${ticket.price} SOL`);
    
    // Simulate purchase transaction
    const mockTransaction = 'BUY' + Date.now().toString(36).toUpperCase();
    
    // Transfer ownership
    ticket.owner = buyerWallet;
    ticket.isListed = false;
    
    console.log(`   ✅ Ownership transferred to: ${buyerWallet}`);
    
    res.json({
      success: true,
      transaction: mockTransaction,
      ticket: ticket
    });
  } catch (error) {
    console.error('❌ Marketplace buy error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// Get marketplace listings
app.get('/marketplace', (req, res) => {
  console.log('🏪 Loading marketplace listings...');
  const listedTickets = userTickets.filter(t => t.isListed);
  console.log(`   ✅ Found ${listedTickets.length} listed tickets`);
  listedTickets.forEach((ticket, i) => {
    console.log(`   ${i+1}. ${ticket.name} - ${ticket.price} SOL - ${ticket.mint.slice(0,8)}...`);
  });
  res.json(listedTickets);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('  POST /buy-ticket - Purchase a ticket');
  console.log('  POST /list-ticket - List ticket for sale');
  console.log('  POST /buy-from-marketplace - Buy from marketplace');
  console.log('  GET /my-tickets - Get user tickets');
  console.log('  GET /available-tickets - Get available tickets');
  console.log('  GET /marketplace - Get marketplace listings');
  console.log('\n🎫 Demo tickets available!');
  console.log('\n🔗 Make sure minting service is running on port 3002');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} in use, trying ${PORT + 2}...`);
    PORT = PORT + 2;
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });
  }
});