# Eventix - Blockchain Event Ticketing Platform

A comprehensive event ticketing platform built with blockchain technology, featuring NFT tickets on Solana, secure authentication, and modern web animations.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        EVENTIX ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Frontend  │    │   Backend   │    │   Minting   │         │
│  │   (HTML/JS) │◄──►│  (Node.js)  │◄──►│   Service   │         │
│  │             │    │             │    │  (Solana)   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │               │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Browser   │    │   MySQL     │    │   Solana    │         │
│  │   Storage   │    │  Database   │    │  Blockchain │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Registration/Login                                        │
│         │                                                       │
│         ▼                                                       │
│  Connect Wallet (Phantom/MetaMask)                             │
│         │                                                       │
│         ▼                                                       │
│  Browse Events ──────────────────┐                             │
│         │                        │                             │
│         ▼                        ▼                             │
│  Select Event              View Marketplace                     │
│         │                        │                             │
│         ▼                        ▼                             │
│  Purchase Ticket           Buy Resale Ticket                   │
│         │                        │                             │
│         ▼                        ▼                             │
│  ┌─────────────────────────────────────────┐                   │
│  │        NFT MINTING PROCESS              │                   │
│  │  1. Validate Payment                    │                   │
│  │  2. Create Metadata (IPFS)              │                   │
│  │  3. Mint NFT on Solana                  │                   │
│  │  4. Store in Database                   │                   │
│  │  5. Generate QR Code                    │                   │
│  └─────────────────────────────────────────┘                   │
│                        │                                       │
│                        ▼                                       │
│                 Ticket in Wallet                               │
│                        │                                       │
│                        ▼                                       │
│              ┌─────────────────────┐                           │
│              │   RESALE PROCESS    │                           │
│              │  1. List for Sale   │                           │
│              │  2. Smart Contract  │                           │
│              │     Validation      │                           │
│              │  3. Transfer NFT    │                           │
│              │  4. Update Database │                           │
│              └─────────────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure & File Organization

### 🌐 Frontend Files (eventix/)
```
eventix/
├── assets/                     # Media Assets
│   ├── images/                 # Event & UI Images
│   │   ├── concert1.jpg        # Event carousel images
│   │   ├── concert2.jpg
│   │   ├── standup.jpg
│   │   ├── art exhibition.jpg
│   │   ├── sportsbanner.jpg
│   │   ├── phantom.png         # Wallet icons
│   │   └── metamask.png
│   ├── icons/                  # Social Media Icons
│   │   ├── facebook-svgrepo-com.svg
│   │   ├── instagram-svgrepo-com.svg
│   │   └── twitter-svgrepo-com.svg
│   └── videos/                 # Background Videos
│       └── 1692701-uhd_3840_2160_30fps.mp4
├── data/
│   └── events.json             # Event data configuration
├── index.html                  # Homepage with hero section
├── events.html                 # Events listing & marketplace
├── mytickets.html              # User ticket management
├── getstarted.html             # Authentication page
├── about.html                  # About page with animations
├── style.css                   # Main stylesheet
├── cinematic-style.css         # Animation styles
├── includes.js                 # Shared components (navbar/footer)
├── auth.js                     # Authentication logic
├── cinematic-animations.js     # Three.js animations
└── server.js                   # Frontend development server
```

### 🔧 Backend Files (backend/)
```
backend/
├── routes/                     # API Route Handlers
│   ├── auth.js                 # Authentication endpoints
│   ├── events.js               # Event management
│   └── tickets.js              # Ticket operations
├── middleware/                 # Custom Middleware
│   └── auth.js                 # JWT authentication
├── server.js                   # Main Express server
├── database.js                 # MySQL connection & queries
└── package.json                # Backend dependencies
```

### ⛓️ Blockchain Files (minting-service/)
```
minting-service/
├── minting-server.js           # Solana NFT minting service
├── solana-config.js            # Blockchain configuration
├── nft-metadata.js             # IPFS metadata handling
└── package.json                # Minting service dependencies
```

### 🔐 Smart Contract Files (programs/)
```
programs/
└── ticket_market/
    └── src/
        └── lib.rs              # Solana smart contract (Rust)
```

### 🛠️ Configuration Files (Root)
```
├── .env                        # Environment variables
├── package.json                # Root dependencies
├── start-all.js                # Service orchestrator
├── Cargo.toml                  # Rust project configuration
└── Anchor.toml                 # Solana program configuration
```

## 📋 File Categories & Connections

### 🌐 Frontend Category
**Core Pages:**
- `index.html` → Main landing page with hero video and event carousel
- `events.html` → Event listing and marketplace functionality
- `mytickets.html` → User ticket management with QR codes
- `getstarted.html` → Authentication with Google OAuth integration

**Styling & Assets:**
- `style.css` → Main styling for all pages
- `cinematic-style.css` → Advanced animations and effects
- `assets/` → Organized media files (images, icons, videos)

**JavaScript Logic:**
- `includes.js` → Shared navbar/footer components and wallet integration
- `auth.js` → User authentication and session management
- `cinematic-animations.js` → Three.js particle effects and animations

**Data Configuration:**
- `data/events.json` → Event information loaded by frontend and backend

### 🔧 Backend Category
**Main Server:**
- `server.js` → Express.js server with API endpoints and middleware

**Database Layer:**
- `database.js` → MySQL connection, table creation, and CRUD operations

**API Routes:**
- `routes/auth.js` → User registration, login, Google OAuth
- `routes/events.js` → Event CRUD operations
- `routes/tickets.js` → Ticket booking, listing, transfers

**Middleware:**
- `middleware/auth.js` → JWT token validation and user authentication

### ⛓️ Blockchain Category
**Minting Service:**
- `minting-server.js` → NFT creation, metadata upload, Solana transactions
- `solana-config.js` → Wallet configuration and network settings
- `nft-metadata.js` → IPFS integration for decentralized storage

**Smart Contract:**
- `programs/ticket_market/src/lib.rs` → Solana program for anti-scalping logic

**Configuration:**
- `.env` → Solana network, IPFS, and database credentials
- `Cargo.toml` → Rust dependencies for smart contract
- `Anchor.toml` → Solana program deployment configuration

## 🔗 File Interconnections

### Frontend ↔ Backend Communication
```
Frontend (JavaScript) ──HTTP API──► Backend (Express.js)
     │                                      │
     │                                      ▼
     │                              MySQL Database
     │                                      │
     └──────────────────────────────────────┘
```

### Backend ↔ Blockchain Communication
```
Backend (Node.js) ──HTTP API──► Minting Service (Node.js)
                                        │
                                        ▼
                                Solana Blockchain
                                        │
                                        ▼
                                 IPFS Storage
```

### Data Flow Example (Ticket Purchase):
1. **Frontend** (`events.html`) → User clicks "Buy Ticket"
2. **Frontend** (`includes.js`) → Validates wallet connection
3. **Frontend** → Sends POST request to `/buy-ticket`
4. **Backend** (`server.js`) → Receives request, validates data
5. **Backend** (`database.js`) → Checks user and event in MySQL
6. **Backend** → Calls minting service via HTTP
7. **Minting Service** (`minting-server.js`) → Creates NFT metadata
8. **Minting Service** (`solana-config.js`) → Mints NFT on Solana
9. **Minting Service** → Returns mint address to backend
10. **Backend** (`database.js`) → Stores ticket in MySQL
11. **Backend** → Returns success response to frontend
12. **Frontend** (`mytickets.html`) → Displays new ticket with QR code

## 🚀 Methodology

### 1. **Blockchain-First Architecture**
- Real NFT minting on Solana devnet
- Smart contract anti-scalping enforcement
- IPFS decentralized metadata storage
- Wallet-based authentication

### 2. **Full-Stack Integration**
- Express.js REST API backend
- MySQL database for persistent storage
- Modern frontend with animations
- Real-time wallet connectivity

### 3. **Security Implementation**
- JWT-based authentication
- bcrypt password hashing
- Smart contract resale limits
- Input validation and sanitization

### 4. **User Experience Focus**
- Responsive design across devices
- Smooth animations and transitions
- Premium loading states
- Multi-wallet support (Phantom & MetaMask)

### 5. **Anti-Scalping Features**
- Maximum 25% markup on resales
- Limited to 3 resales per ticket
- Smart contract enforcement
- Blockchain state validation

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3** - Modern web standards
- **JavaScript ES6+** - Client-side logic
- **Anime.js** - Smooth animations
- **Three.js** - 3D particle effects
- **GSAP ScrollTrigger** - Scroll animations

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **bcrypt** - Password hashing
- **JWT** - Token authentication

### Blockchain
- **Solana** - High-performance blockchain
- **Anchor Framework** - Solana development
- **Rust** - Smart contract language
- **IPFS/Pinata** - Decentralized storage
- **Metaplex** - NFT standard

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **Anchor CLI** - Solana deployment
- **Phantom/MetaMask** - Wallet integration

## 🔐 Environment Configuration

### Required Environment Variables (.env)
```env
# Solana Configuration
KEYPAIR_PATH=../utils/demo-keypair.json
CLUSTER=devnet
RPC_URL=https://api.devnet.solana.com

# IPFS Configuration
PINATA_GATEWAY=tan-tired-aphid-453.mypinata.cloud
PINATA_JWT=your_pinata_jwt_token

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=eventix_db

# Authentication
JWT_SECRET=your_jwt_secret
PORT=3001

# Smart Contract
dummykey=Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw
```

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Install Node.js (v16+)
# Install MySQL Server
# Install Rust and Solana CLI
# Install Anchor Framework
```

### 2. Installation
```bash
git clone <repository-url>
cd solana-ticket-proto-main
npm install
cd eventix && npm install && cd ..
cd backend && npm install && cd ..
cd minting-service && npm install && cd ..
```

### 3. Database Setup
```sql
CREATE DATABASE eventix_db;
-- Tables created automatically on first run
```

### 4. Start Services
```bash
npm run start-all
# Or individually:
# npm run start:minting    # Port 3002
# npm run start:backend    # Port 3001
# npm run start:frontend   # Port 8080
```

### 5. Access Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Minting Service**: http://localhost:3002

## 📊 Key Features

### ✅ Implemented Features
- Real Solana NFT minting on devnet
- Smart contract anti-scalping enforcement
- Google OAuth authentication
- Multi-wallet support (Phantom & MetaMask)
- MySQL database integration
- Premium UI with animations
- QR code ticket verification
- Marketplace resale functionality
- IPFS decentralized storage

### 🔒 Security Features
- JWT token authentication
- bcrypt password hashing
- Smart contract resale limits
- Input validation and sanitization
- CORS protection
- SQL injection prevention

## 📞 Support & Documentation

- **Repository**: https://github.com/NHR-09/eventix-blockchain-ticketing
- **Smart Contract**: `Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw` (Solana Devnet)
- **Network**: Solana Devnet
- **IPFS Gateway**: Pinata

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the future of event ticketing**