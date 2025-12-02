# Eventix - Blockchain Event Ticketing Platform

A comprehensive event ticketing platform built with blockchain technology, featuring NFT tickets on Solana, secure authentication, and modern web animations.

## 🏗️ Architecture Overview

### Frontend 
- **Technology**: HTML5, CSS3, JavaScript (ES6+)
- **Animations**: Anime.js, GSAP ScrollTrigger, Three.js
- **Features**: Responsive design, cinematic animations, wallet integration
- **Location**: `/eventix/` directory

### Backend API 
- **Technology**: Node.js, Express.js
- **Database**: MySQL with bcrypt authentication
- **Features**: User management, event CRUD, ticket booking
- **Location**: `/backend/` directory

### Minting Service 
- **Technology**: Node.js, Solana Web3.js
- **Blockchain**: Solana network integration
- **Features**: NFT ticket minting, wallet operations
- **Location**: `/minting-service/` directory

## 🚀 Quick Start Guide

### Prerequisites
```bash
# Install Node.js (v16+)
# Install MySQL Server
# Install Git
```

### 1. Clone Repository
```bash
git clone <repository-url>
cd solana-ticket-proto-main
```

### 2. Database Setup
```sql
-- Create MySQL database
CREATE DATABASE eventix_db;
USE eventix_db;

-- Tables will be created automatically on first run
```

### 3. Install Dependencies
```bash
# Install all dependencies
npm install

# Install frontend dependencies
cd eventix && npm install && cd ..

# Install backend dependencies  
cd backend && npm install && cd ..

# Install minting service dependencies
cd minting-service && npm install && cd ..
```

### 4. Environment Configuration
Create `.env` files in each service directory:

**Backend (.env)**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_passworD
DB_NAME=eventix_db
JWT_SECRET=your_jwt_secret
PORT=3001
```

**Minting Service (.env)**
```env
SOLANA_NETWORK=devnet
PRIVATE_KEY=your_solana_private_key
PORT=3002
```

### 5. Start All Services
```bash
# Option 1: Start all services at once
npm run start-all

# Option 2: Start services individually
npm run start:minting    # Port 3002
npm run start:backend    # Port 3001  
npm run start:frontend   # Port 8080
```

### 6. Access Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Minting Service**: http://localhost:3002

## 📁 Project Structure

```
solana-ticket-proto-main/
├── eventix/                    # Frontend Application
│   ├── index.html             # Home page
│   ├── about.html             # About page with animations
│   ├── events.html            # Events listing
│   ├── login.html             # User authentication
│   ├── register.html          # User registration
│   ├── mytickets.html         # User tickets
│   ├── style.css              # Main styles
│   ├── cinematic-style.css    # Animation styles
│   ├── includes.js            # Navbar/footer components
│   ├── auth.js                # Authentication logic
│   ├── cinematic-animations.js # Three.js animations
│   └── server.js              # Frontend server
├── backend/                   # Backend API Server
│   ├── server.js              # Main server file
│   ├── database.js            # MySQL connection
│   ├── routes/                # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── events.js         # Event management
│   │   └── tickets.js        # Ticket operations
│   └── middleware/            # Custom middleware
├── minting-service/           # Blockchain Service
│   ├── minting-server.js      # Solana minting server
│   ├── solana-config.js       # Blockchain configuration
│   └── nft-metadata.js        # NFT metadata handling
├── start-all.js               # Service orchestrator
└── package.json               # Root dependencies
```

## 🎨 Frontend Features

### Pages & Components
- **Home**: Hero section with video background, event carousel
- **About**: Cinematic animations with Three.js particle system
- **Events**: Dynamic event listing with filtering
- **Authentication**: Login/register with form validation
- **My Tickets**: User ticket management with QR codes
- **Wallet Integration**: Phantom & MetaMask support

### Animation System
- **Three.js**: 3D particle background with concert lighting
- **GSAP ScrollTrigger**: Scroll-based animations
- **Anime.js**: Smooth element transitions and counters
- **Responsive**: Mobile-first design with breakpoints

### Key Files
- `cinematic-animations.js`: Main animation controller
- `includes.js`: Shared navbar/footer components
- `auth.js`: User authentication handling
- `style.css`: Core styling and responsive design

## 🔧 Backend API

### Authentication Endpoints
```javascript
POST /api/register          // User registration
POST /api/login            // User login
PUT  /api/user/:id         // Update user profile
POST /api/logout           // User logout
```

### Event Management
```javascript
GET    /api/events         // List all events
POST   /api/events         // Create new event
GET    /api/events/:id     // Get event details
PUT    /api/events/:id     // Update event
DELETE /api/events/:id     // Delete event
```

### Ticket Operations
```javascript
POST /api/tickets/book     // Book ticket
GET  /api/tickets/user/:id // Get user tickets
POST /api/tickets/transfer // Transfer ticket
GET  /api/tickets/verify   // Verify ticket
```

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table  
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATETIME NOT NULL,
  venue VARCHAR(255),
  price DECIMAL(10,2),
  total_tickets INT,
  available_tickets INT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  event_id INT,
  nft_mint_address VARCHAR(255),
  qr_code TEXT,
  status ENUM('active', 'used', 'transferred'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);
```

## ⛓️ Smart Contract & Minting Service

### Solana Integration
- **Network**: Devnet (Program ID: `Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw`)
- **Wallet**: Phantom & MetaMask integration
- **NFTs**: Real Metaplex NFTs with IPFS metadata
- **Storage**: Pinata IPFS gateway
- **Anti-Scalping**: Smart contract enforced resale limits

### Smart Contract Features
- **One-Time Resale**: Tickets can only be resold once
- **Max Markup**: 25% maximum markup on original price
- **Owner Verification**: Only ticket owner can list for resale
- **Blockchain State**: `has_been_sold` and `sale_count` tracking

### Minting Endpoints
```javascript
POST /mint                 // Mint real NFT + smart contract ticket
POST /list                 // List ticket for resale (with smart contract validation)
POST /transfer             // Transfer NFT ownership (real blockchain transaction)
GET  /info/:mintAddress    // Get smart contract ticket info
```

### Key Features
- **Real NFT minting** on Solana devnet
- **Smart contract integration** for anti-scalping
- **IPFS metadata storage** for permanence
- **Blockchain state validation** before transfers
- **Proper NFT ownership transfer** (not new minting)

## 🛠️ Development

### Local Development
```bash
# Start in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=eventix_db

# Authentication
JWT_SECRET=your-secret-key
BCRYPT_ROUNDS=10

# Solana
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
PRIVATE_KEY=your-solana-private-key

# IPFS
IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_API_KEY=your-pinata-key
```

## 🚀 Deployment

### Production Setup
1. **Database**: Set up MySQL on production server
2. **Environment**: Configure production environment variables
3. **SSL**: Enable HTTPS for secure wallet connections
4. **CDN**: Use CDN for static assets
5. **Monitoring**: Set up logging and monitoring

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Server-side validation
- **Wallet Security**: Signature verification
- **Anti-Scalping**: Smart contract enforced resale limits
- **Blockchain Validation**: Real-time smart contract state checks
- **NFT Authenticity**: Immutable blockchain ownership records

## 🎯 Key Features

### User Experience
- ✅ Responsive design across all devices
- ✅ Smooth animations and transitions
- ✅ Intuitive navigation and UX
- ✅ Real-time wallet integration (Phantom & MetaMask)
- ✅ QR code ticket verification
- ✅ Multi-wallet support with proper isolation

### Technical Features
- ✅ MySQL database with proper relations
- ✅ RESTful API architecture
- ✅ **Real Solana NFT minting on devnet**
- ✅ IPFS decentralized storage via Pinata
- ✅ Modern JavaScript (ES6+)
- ✅ Modular component architecture
- ✅ **Smart contract anti-scalping enforcement**

### Business Features
- ✅ Event management system
- ✅ Ticket booking and transfers
- ✅ User authentication and profiles
- ✅ **Blockchain-enforced fraud prevention**
- ✅ **Anti-scalping marketplace (one resale only)**
- ✅ **Real NFT ownership transfer**

## 📞 Support

For issues and questions:
- **Email**: support@eventix.com
- **Documentation**: Check inline code comments
- **Issues**: Create GitHub issues for bugs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🚀 Live Demo

- **Repository**: https://github.com/NHR-09/eventix-blockchain-ticketing
- **Smart Contract**: `Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw` (Solana Devnet)
- **Network**: Solana Devnet
- **IPFS**: Pinata Gateway

## 🎫 Anti-Scalping Implementation

The platform implements **real smart contract anti-scalping** rules:

1. **Original Purchase**: Creates NFT + Smart Contract ticket with `has_been_sold = false`
2. **First Resale**: User can list ticket, smart contract validates ownership and markup
3. **Blockchain Transfer**: Real `buy_ticket` transaction updates `has_been_sold = true`
4. **Second Resale Attempt**: Smart contract **blocks** with `TicketAlreadySold` error

This ensures each ticket can only be resold **once**, preventing scalping while maintaining legitimate resale functionality.

**Built with ❤️ for the future of event ticketing**
