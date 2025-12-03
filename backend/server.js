import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { initDatabase, createUser, findUserByEmail, createTicket, getUserTickets, updateTicketListing, updateTicketOwner, getMarketplaceTickets, addResaleHistory, getResaleCount } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize database
await initDatabase();

// Load events from JSON file
function loadEvents() {
  try {
    const eventsPath = path.join(__dirname, '../eventix/data/events.json');
    const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
    const TICKET_TYPES = {};
    
    eventsData.events.forEach(event => {
      TICKET_TYPES[event.id] = {
        name: event.title,
        description: event.venue,
        eventDate: event.date,
        price: parseFloat(event.price.replace(' SOL', '')),
        seat: 'GA-001',
        image: event.image
      };
    });
    
    return TICKET_TYPES;
  } catch (error) {
    console.error('Error loading events:', error);
    return {};
  }
}

const TICKET_TYPES = loadEvents();

// Authentication endpoints
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.json({ success: false, error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(name, email, hashedPassword);
    console.log(`✅ User registered: ${email}`);
    
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.json({ success: false, error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await findUserByEmail(email);
    if (!user) {
      return res.json({ success: false, error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ success: false, error: 'Invalid credentials' });
    }
    
    console.log(`✅ User logged in: ${email}`);
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.json({ success: false, error: 'Login failed' });
  }
});

// Buy ticket endpoint
app.post('/buy-ticket', async (req, res) => {
  try {
    console.log('🎫 Processing ticket purchase request...');
    const { ticketType, walletAddress } = req.body;
    console.log(`   Ticket type requested: ${ticketType}`);
    console.log(`   Buyer wallet: ${walletAddress}`);
    
    if (!walletAddress) {
      return res.json({ success: false, error: 'Wallet address required' });
    }
    
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
        image: ticketInfo.image,
        isListed: false,
        owner: walletAddress,
        createdAt: new Date().toISOString()
      };
      
      await createTicket(ticket);
      console.log(`   ✅ Ticket stored for ${walletAddress} in database!`);
      
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
    const { ticketId, price, walletAddress } = req.body;
    
    // Find ticket
    const userTickets = await getUserTickets(walletAddress);
    const ticket = userTickets.find(t => t.mint === ticketId);
    if (!ticket) {
      return res.json({ success: false, error: 'Ticket not found or not owned by you' });
    }

    // Check resale count (max 3 resales)
    const resaleCount = await getResaleCount(ticketId);
    if (resaleCount >= 3) {
      return res.json({ success: false, error: 'Maximum resales (3) exceeded' });
    }

    // Check markup limit (25%)
    const maxPrice = ticket.originalPrice * 1.25;
    if (price > maxPrice) {
      return res.json({ success: false, error: `Price exceeds 25% markup limit. Max: ${maxPrice.toFixed(3)} SOL` });
    }

    // Call listing service
    const listResult = await listTicketForSale(ticketId, price);
    
    if (listResult.success) {
      await updateTicketListing(ticketId, price, true);
      
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
app.get('/my-tickets', async (req, res) => {
  const walletAddress = req.query.wallet || req.headers['wallet-address'];
  
  if (!walletAddress) {
    return res.json({ error: 'Wallet address required' });
  }
  
  console.log(`🎫 Loading tickets for wallet: ${walletAddress}`);
  const userSpecificTickets = await getUserTickets(walletAddress);
  
  console.log(`   ✅ User has ${userSpecificTickets.length} tickets`);
  userSpecificTickets.forEach((ticket, i) => {
    console.log(`   ${i+1}. ${ticket.name} - ${ticket.mint.slice(0,8)}... - ${ticket.isListed ? 'Listed' : 'Not Listed'}`);
  });
  
  res.json(userSpecificTickets);
});

// Get available tickets
app.get('/available-tickets', (req, res) => {
  console.log('🎫 Loading available tickets from events.json...');
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

// Transfer NFT function - calls minting service
async function transferNFT(mintAddress, fromWallet, toWallet, price) {
  try {
    console.log(`🔄 Calling NFT transfer service: ${mintAddress} from ${fromWallet} to ${toWallet}`);
    
    const response = await fetch('http://localhost:3002/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mintAddress, 
        fromWallet, 
        toWallet, 
        price 
      })
    });
    
    const result = await response.json();
    console.log(`📝 Transfer service response:`, result);
    
    return result;
  } catch (error) {
    console.error(`❌ Transfer service error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Buy ticket from marketplace
app.post('/buy-from-marketplace', async (req, res) => {
  try {
    console.log('🛒 Processing marketplace purchase...');
    const { ticketId, buyerWallet } = req.body;
    console.log(`   Ticket: ${ticketId}, Buyer: ${buyerWallet}`);
    
    // Find the listed ticket
    const marketplaceTickets = await getMarketplaceTickets();
    const ticket = marketplaceTickets.find(t => t.mint === ticketId);
    if (!ticket) {
      console.log(`   ❌ Ticket not found or not listed: ${ticketId}`);
      return res.json({ success: false, error: 'Ticket not available' });
    }
    
    console.log(`   ✅ Found ticket: ${ticket.name} - ${ticket.price} SOL`);
    console.log(`   🔄 Transferring NFT ownership...`);
    
    // Call NFT transfer service
    const transferResult = await transferNFT(ticketId, ticket.owner, buyerWallet, ticket.price);
    
    if (transferResult.success) {
      // Record resale history
      const resaleCount = await getResaleCount(ticketId);
      await addResaleHistory({
        ticketId,
        fromWallet: ticket.owner,
        toWallet: buyerWallet,
        price: ticket.price,
        resaleNumber: resaleCount + 1
      });
      
      // Update ownership in backend
      await updateTicketOwner(ticketId, buyerWallet);
      
      console.log(`   ✅ NFT ownership transferred to: ${buyerWallet}`);
      console.log(`   📊 Resale #${resaleCount + 1} recorded`);
      
      res.json({
        success: true,
        transaction: transferResult.transaction,
        ticket: ticket
      });
    } else {
      console.log(`   ❌ NFT transfer failed: ${transferResult.error}`);
      res.json({ success: false, error: transferResult.error });
    }
  } catch (error) {
    console.error('❌ Marketplace buy error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// Get marketplace listings
app.get('/marketplace', async (req, res) => {
  console.log('🏪 Loading marketplace listings...');
  const listedTickets = await getMarketplaceTickets();
  const ticketsWithResaleInfo = await Promise.all(listedTickets.map(async ticket => {
    const resaleCount = await getResaleCount(ticket.mint);
    return {
      ...ticket,
      resaleCount,
      canResale: resaleCount < 3
    };
  }));
  console.log(`   ✅ Found ${ticketsWithResaleInfo.length} listed tickets`);
  res.json(ticketsWithResaleInfo);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('  POST /api/register - User registration');
  console.log('  POST /api/login - User login');
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