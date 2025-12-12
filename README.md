# Eventix - Blockchain Event Ticketing Platform

A comprehensive event ticketing platform built with blockchain technology, featuring **real NFT tickets on Solana**, smart contract anti-scalping enforcement, IPFS decentralized storage, and modern web animations.

## 🏗️ Complete Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              EVENTIX BLOCKCHAIN ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│  │   Frontend  │    │   Backend   │    │   Minting   │    │ Smart       │           │
│  │   (HTML/JS) │◄──►│  (Node.js)  │◄──►│   Service   │◄──►│ Contract    │           │
│  │             │    │             │    │  (Solana)   │    │ (Rust)      │           │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘           │
│         │                   │                   │                   │               │
│         │                   │                   │                   │               │
│         ▼                   ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│  │   Browser   │    │   MySQL     │    │   Solana    │    │    IPFS     │           │
│  │   Storage   │    │  Database   │    │  Blockchain │    │  (Pinata)   │           │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘           │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## ⛓️ Blockchain Technology Stack

### **Real Blockchain Implementation**
- **Solana Devnet**: Live blockchain network for NFT minting
- **Metaplex Protocol**: NFT standard for ticket creation
- **Anchor Framework**: Rust-based smart contract development
- **IPFS/Pinata**: Decentralized metadata and image storage
- **Real Cryptography**: Ed25519 signatures, SHA-256 hashing

## 🔐 Cryptographic Security Implementation

### **Authentication & Security**
```
┌─────────────────────────────────────────────────────────────────┐
│                    CRYPTOGRAPHIC SECURITY                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Passwords ──► bcrypt (10 rounds) ──► Database Storage     │
│                                                                 │
│  Wallet Signatures ──► Ed25519 ──► Solana Transaction           │
│                                                                 │
│  NFT Metadata ──► SHA-256 Hash ──► IPFS Content ID              │
│                                                                 │
│  Smart Contract ──► Program Derived Address ──► Anti-Scalping   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Complete Blockchain Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Registration/Login                                        │
│         │                                                       │
│         ▼                                                       │
│  Connect Wallet (Phantom/MetaMask)                              │
│         │                                                       │
│         ▼                                                       │
│  Browse Events ──────────────────┐                              │
│         │                        │                              │
│         ▼                        ▼                              │
│  Select Event              View Marketplace                     │
│         │                        │                              │
│         ▼                        ▼                              │
│  Purchase Ticket           Buy Resale Ticket                    │
│         │                        │                              │
│         ▼                        ▼                              │
│  ┌─────────────────────────────────────────┐                    │
│  │        NFT MINTING PROCESS              │                    │
│  │  1. Validate Payment                    │                    │
│  │  2. Create Metadata (IPFS)              │                    │
│  │  3. Mint NFT on Solana                  │                    │
│  │  4. Store in Database                   │                    │
│  │  5. Generate QR Code                    │                    │
│  └─────────────────────────────────────────┘                    │
│                        │                                        │
│                        ▼                                        │
│                 Ticket in Wallet                                │
│                        │                                        │
│                        ▼                                        │
│              ┌─────────────────────┐                            │
│              │   RESALE PROCESS    │                            │
│              │  1. List for Sale   │                            │
│              │  2. Smart Contract  │                            │
│              │     Validation      │                            │
│              │  3. Transfer NFT    │                            │
│              │  4. Update Database │                            │
│              └─────────────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## ⛓️ Smart Contract & On-Chain Logic

### **Rust Smart Contract (`programs/ticket_market/src/lib.rs`)**
```rust
// Anti-scalping enforcement on Solana blockchain
pub fn list_ticket(ctx: Context<ListTicket>, new_price: u64) -> Result<()> {
    let ticket = &mut ctx.accounts.ticket;
    
    // Enforce maximum 3 resales per ticket
    require!(ticket.sale_count < 3, TicketError::MaxResalesExceeded);
    
    // Enforce 25% maximum markup from original price
    let max_allowed_price = ticket.original_price + 
        (ticket.original_price * ticket.max_markup as u64 / 100);
    require!(new_price <= max_allowed_price, TicketError::ExceedsMaxMarkup);
    
    ticket.price = new_price;
    ticket.is_listed = true;
    Ok(())
}
```

### **Program Derived Addresses (PDAs)**
- **Deterministic**: `["ticket", organizer_pubkey, mint_pubkey]`
- **Unique**: Each ticket has a unique on-chain address
- **Secure**: Only program can modify ticket state

### **On-Chain Data Structure (93 bytes)**
```rust
pub struct Ticket {
    pub owner: Pubkey,        // 32 bytes - Current owner
    pub price: u64,           // 8 bytes - Current price in lamports
    pub resale_allowed: bool, // 1 byte - Can be resold
    pub max_markup: u8,       // 1 byte - Maximum markup percentage
    pub original_price: u64,  // 8 bytes - Original mint price
    pub is_listed: bool,      // 1 byte - Currently for sale
    pub mint: Pubkey,         // 32 bytes - NFT mint address
    pub has_been_sold: bool,  // 1 byte - Ever been sold
    pub sale_count: u8,       // 1 byte - Number of resales (max 3)
}
```

## 🌐 IPFS Decentralized Storage

### **Metadata Storage Process**
1. **Image Upload**: Ticket image → IPFS → Content ID (CID)
2. **Metadata Creation**: JSON with image CID → IPFS → Metadata CID
3. **NFT Minting**: Metadata CID embedded in Solana NFT
4. **Decentralized Access**: `https://gateway.pinata.cloud/ipfs/{CID}`

### **IPFS Implementation (`minting-service/minting-server.js`)**
```javascript
// Upload image to IPFS
async function uploadToIPFS(filePath, fileName) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  
  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', 
    formData, {
      headers: { Authorization: `Bearer ${PINATA_JWT}` }
    });
  
  return `https://${PINATA_GATEWAY}/ipfs/${res.data.IpfsHash}`;
}

// Upload JSON metadata to IPFS
async function uploadJSONToIPFS(metadata) {
  const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    pinataContent: metadata
  });
  
  return `https://${PINATA_GATEWAY}/ipfs/${res.data.IpfsHash}`;
}
```

## 📁 Detailed Code Organization & Function Mapping

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
├── server.js                   # Main Express server with organized functions
├── database.js                 # MySQL connection & queries with memory fallback
├── package.json                # Backend dependencies
└── package-lock.json           # Dependency lock file
```

### ⛓️ Blockchain Files (minting-service/)
```
minting-service/
├── minting-server.js           # Complete Solana NFT minting & smart contract service
├── package.json                # Minting service dependencies
└── package-lock.json           # Dependency lock file
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
├── Anchor.toml                 # Solana program configuration
├── target/                     # Compiled Solana program artifacts
│   ├── deploy/                 # Deployment files
│   ├── idl/                    # Interface Definition Language files
│   └── types/                  # TypeScript type definitions
└── utils/
    └── demo-keypair.json       # Ed25519 keypair for blockchain transactions
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
- `server.js` → Express.js server with organized function sections:
  - Authentication Functions (register, login, Google OAuth)
  - Ticket Purchase Functions (buy-ticket endpoint)
  - Marketplace Functions (list-ticket, buy-from-marketplace)
  - GET Functions (my-tickets, available-tickets, marketplace)
  - Minting Service Functions (mintTicket, listTicketForSale)
  - NFT Transfer Functions (transferNFT)

**Database Layer:**
- `database.js` → MySQL connection with memory fallback, table creation, and CRUD operations

### ⛓️ Blockchain Category
**Minting Service:**
- `minting-server.js` → Complete blockchain service including:
  - IPFS file and metadata upload (Pinata integration)
  - Solana NFT minting using Metaplex protocol
  - Smart contract ticket creation with anti-scalping
  - Ed25519 keypair management and transaction signing
  - Program Derived Address (PDA) generation

**Smart Contract:**
- `programs/ticket_market/src/lib.rs` → Rust smart contract with:
  - Anti-scalping enforcement (max 3 resales, 25% markup)
  - On-chain ticket data structure (93 bytes)
  - Program Derived Address security

**Blockchain Assets:**
- `utils/demo-keypair.json` → Ed25519 keypair for transaction signing
- `target/idl/ticket_market.json` → Smart contract interface definition
- `target/deploy/` → Compiled Solana program files

**Configuration:**
- `.env` → Solana devnet RPC, IPFS/Pinata credentials, database settings
- `Anchor.toml` → Solana program deployment configuration

## ⛓️ Blockchain Function Flow

### **NFT Minting Process (`minting-service/minting-server.js`)**
```javascript
// Complete blockchain minting workflow
async function mintTicketWithSmartContract({
  imagePath, name, description, eventDate, seat, price
}) {
  // 1. Cryptographic wallet setup
  const solKeypair = readKeypairFromFile(KEYPAIR_PATH);
  const connection = await createRobustConnection(RPC_URL);
  
  // 2. IPFS decentralized storage
  const imageUri = await uploadToIPFS(imagePath);
  const metadataUri = await uploadJSONToIPFS(metadata);
  
  // 3. Solana NFT creation using Metaplex
  const mint = generateSigner(umi);
  const nftResult = await createNft(umi, {
    mint, name, symbol: 'TICKET', uri: metadataUri,
    tokenStandard: TokenStandard.NonFungible
  }).sendAndConfirm(umi);
  
  // 4. Smart contract ticket creation
  const smartContractResult = await createSmartContractTicket(
    connection, solKeypair, mint.publicKey.toString(), price
  );
  
  return {
    mintAddress: mint.publicKey.toString(),
    ticketPda: smartContractResult.ticketPda,
    nftSignature, smartContractSignature
  };
}
```

### **Smart Contract Integration**
```javascript
// Create on-chain ticket with anti-scalping rules
async function createSmartContractTicket(connection, wallet, mintAddress, price) {
  // Generate Program Derived Address
  const [ticketPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('ticket'), wallet.publicKey.toBuffer(), mintPubkey.toBuffer()],
    PROGRAM_ID
  );
  
  // Create instruction data (93 bytes)
  const instructionData = Buffer.alloc(8 + 8 + 1 + 1 + 32);
  
  // Instruction discriminator for create_ticket
  const discriminator = Buffer.from([16, 178, 122, 25, 213, 85, 96, 129]);
  discriminator.copy(instructionData, 0);
  
  // Price in lamports (1 SOL = 1,000,000,000 lamports)
  const priceInLamports = Math.floor(price * LAMPORTS_PER_SOL);
  Buffer.from(priceInLamports.toString()).copy(instructionData, 8);
  
  // Anti-scalping parameters
  instructionData.writeUInt8(1, 16); // Resale allowed
  instructionData.writeUInt8(25, 17); // 25% max markup
  
  // Submit to Solana blockchain
  const transaction = new Transaction().add(instruction);
  const signature = await connection.sendTransaction(transaction, [wallet]);
  
  return { ticketPda: ticketPda.toBase58(), signature };
}
```

## 🔗 Complete System Interconnections

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

### **Complete Blockchain Data Flow (Ticket Purchase)**:
1. **Frontend** (`events.html`) → User clicks "Buy Ticket" with wallet connected
2. **Frontend** (`includes.js`) → Validates Phantom/MetaMask wallet connection
3. **Frontend** → Sends POST request to `/buy-ticket` with wallet address
4. **Backend** (`server.js` - TICKET PURCHASE FUNCTIONS) → Validates request
5. **Backend** (`database.js`) → Checks user authentication and event data
6. **Backend** → Calls minting service: `mintTicket(ticketInfo)`
7. **Minting Service** (`minting-server.js`) → **BLOCKCHAIN OPERATIONS BEGIN**:
   - Loads Ed25519 keypair from `utils/demo-keypair.json`
   - Connects to Solana devnet RPC
   - Uploads ticket image to IPFS via Pinata API
   - Creates JSON metadata with IPFS image URL
   - Uploads metadata to IPFS, gets content hash
   - **Mints real NFT** using Metaplex protocol on Solana
   - **Creates smart contract ticket** with anti-scalping rules
   - Generates Program Derived Address (PDA)
   - Submits transaction to Solana blockchain
8. **Smart Contract** (`lib.rs`) → Executes `create_ticket` instruction:
   - Stores ticket data on-chain (93 bytes)
   - Sets original price, max markup (25%), resale count (0)
   - Returns transaction signature
9. **Minting Service** → Returns mint address and transaction hash
10. **Backend** (`database.js`) → Stores ticket metadata in MySQL with mint address
11. **Backend** → Returns success with blockchain transaction details
12. **Frontend** (`mytickets.html`) → Displays ticket with:
    - QR code containing mint address
    - IPFS image and metadata
    - Solana transaction link
    - Real blockchain verification

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

## 🔐 Cryptographic Implementation Details

### **Wallet Integration & Signatures**
```javascript
// Phantom wallet connection with Ed25519 signatures
async function connectPhantom() {
  if(window.solana && window.solana.isPhantom) {
    const resp = await window.solana.connect();
    const account = resp.publicKey.toString(); // Base58 encoded public key
    localStorage.setItem("wallet", account);
  }
}

// Transaction signing for NFT transfers
const transaction = new Transaction().add(instruction);
const signature = await connection.sendTransaction(transaction, [wallet]);
```

### **Password Security**
```javascript
// bcrypt hashing in backend/server.js
const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds
const validPassword = await bcrypt.compare(password, user.password);
```

### **Smart Contract Security**
```rust
// Rust ownership validation
require!(ticket.owner == *ctx.accounts.owner.key, TicketError::NotTicketOwner);

// Anti-scalping price validation
let max_allowed_price = ticket.original_price + 
    (ticket.original_price * ticket.max_markup as u64 / 100);
require!(new_price <= max_allowed_price, TicketError::ExceedsMaxMarkup);
```

## 🛠️ Complete Technology Stack

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

### Blockchain & Cryptography
- **Solana Devnet** - Live blockchain network (400ms block time)
- **Anchor Framework** - Rust-based smart contract framework
- **Rust** - Systems programming language for on-chain logic
- **IPFS/Pinata** - Decentralized content-addressed storage
- **Metaplex Protocol** - NFT standard with royalties and metadata
- **Ed25519** - Elliptic curve digital signatures
- **SHA-256** - Cryptographic hashing for content verification
- **Program Derived Addresses** - Deterministic account generation
- **Lamports** - Smallest unit of SOL (1 SOL = 1B lamports)

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **Anchor CLI** - Solana deployment
- **Phantom/MetaMask** - Wallet integration

## 📊 Function Organization by File

### **Backend Server Functions (`backend/server.js`)**
```javascript
// ==================== AUTHENTICATION FUNCTIONS ====================
app.post('/api/register', async (req, res) => { /* bcrypt password hashing */ });
app.post('/api/login', async (req, res) => { /* JWT token generation */ });
app.post('/api/google-auth', async (req, res) => { /* OAuth integration */ });

// ==================== TICKET PURCHASE FUNCTIONS ====================
app.post('/buy-ticket', async (req, res) => { /* Calls minting service */ });

// ==================== MARKETPLACE FUNCTIONS ====================
app.post('/list-ticket', async (req, res) => { /* Anti-scalping validation */ });
app.post('/buy-from-marketplace', async (req, res) => { /* NFT ownership transfer */ });

// ==================== GET FUNCTIONS ====================
app.get('/my-tickets', async (req, res) => { /* Wallet-specific filtering */ });
app.get('/available-tickets', (req, res) => { /* Event data from JSON */ });
app.get('/marketplace', async (req, res) => { /* Listed tickets with resale info */ });

// ==================== MINTING SERVICE FUNCTIONS ====================
async function mintTicket(ticketInfo) { /* HTTP call to minting service */ }
async function listTicketForSale(mintAddress, price) { /* Smart contract listing */ }

// ==================== NFT TRANSFER FUNCTIONS ====================
async function transferNFT(mintAddress, fromWallet, toWallet, price) { /* Blockchain transfer */ }
```

### **Minting Service Functions (`minting-service/minting-server.js`)**
```javascript
// IPFS Storage Functions
async function uploadToIPFS(filePath, fileName) { /* Pinata file upload */ }
async function uploadJSONToIPFS(metadata, fileName) { /* Pinata JSON upload */ }

// Blockchain Functions
async function createSmartContractTicket(connection, wallet, mintAddress, price) {
  /* Program Derived Address generation and smart contract interaction */
}

async function mintTicketWithSmartContract({ imagePath, name, description, eventDate, seat, price }) {
  /* Complete NFT + Smart Contract creation workflow */
}

// API Endpoints
app.post('/mint', async (req, res) => { /* Real NFT minting */ });
app.post('/list', async (req, res) => { /* Smart contract listing */ });
app.post('/transfer', async (req, res) => { /* NFT ownership transfer */ });
app.get('/info/:mintAddress', async (req, res) => { /* On-chain ticket info */ });
```

### **Smart Contract Functions (`programs/ticket_market/src/lib.rs`)**
```rust
// On-chain instruction handlers
pub fn create_ticket(ctx: Context<CreateTicket>, price: u64, resale_allowed: bool, max_markup: u8, mint: Pubkey) -> Result<()>
pub fn list_ticket(ctx: Context<ListTicket>, new_price: u64) -> Result<()>
pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()>

// Account validation structures
pub struct CreateTicket<'info> { /* PDA creation and validation */ }
pub struct ListTicket<'info> { /* Ownership verification */ }
pub struct BuyTicket<'info> { /* Transfer validation */ }

// On-chain data structure
pub struct Ticket { /* 93-byte on-chain account */ }

// Custom error handling
pub enum TicketError { /* Anti-scalping error codes */ }
```

### **Database Functions (`backend/database.js`)**
```javascript
// User Management
export async function createUser(name, email, hashedPassword) { /* MySQL/Memory storage */ }
export async function findUserByEmail(email) { /* Authentication lookup */ }

// Ticket Management
export async function createTicket(ticketData) { /* Store mint address and metadata */ }
export async function getUserTickets(walletAddress) { /* Wallet-specific filtering */ }
export async function updateTicketListing(mintAddress, price, isListed) { /* Marketplace updates */ }
export async function updateTicketOwner(mintAddress, newOwner) { /* Ownership transfer */ }

// Marketplace Functions
export async function getMarketplaceTickets() { /* Listed tickets */ }
export async function addResaleHistory(historyData) { /* Anti-scalping tracking */ }
export async function getResaleCount(ticketId) { /* Resale limit enforcement */ }
```

## 🔐 Complete Environment Configuration

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

## ⛓️ Real Blockchain Integration

### **Live Solana Devnet Deployment**
- **Program ID**: `Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw`
- **Network**: Solana Devnet (live blockchain)
- **RPC Endpoint**: `https://api.devnet.solana.com`
- **Block Time**: ~400ms (real-time transactions)
- **Transaction Fees**: ~0.000005 SOL per transaction

### **Real NFT Minting Process**
1. **Keypair Loading**: Ed25519 private key from `utils/demo-keypair.json`
2. **Balance Verification**: Ensures sufficient SOL for minting (0.05 SOL minimum)
3. **IPFS Upload**: Image and metadata stored on decentralized network
4. **Metaplex NFT**: Real NFT created with TokenStandard.NonFungible
5. **Smart Contract**: On-chain ticket with anti-scalping rules
6. **Transaction Confirmation**: Blockchain confirmation with signature

### **Anti-Scalping Smart Contract**
```rust
// Maximum 3 resales per ticket
require!(ticket.sale_count < 3, TicketError::MaxResalesExceeded);

// Maximum 25% markup from original price
let max_allowed_price = ticket.original_price + 
    (ticket.original_price * ticket.max_markup as u64 / 100);
require!(new_price <= max_allowed_price, TicketError::ExceedsMaxMarkup);
```

### **IPFS Decentralized Storage**
- **Gateway**: `tan-tired-aphid-453.mypinata.cloud`
- **Content Addressing**: SHA-256 based content IDs
- **Immutable Storage**: Content cannot be modified once uploaded
- **Global Access**: Distributed across IPFS network nodes

## 📊 Implemented Features

### ✅ Blockchain Features
- **Real Solana NFT minting** on devnet with Metaplex protocol
- **Smart contract anti-scalping** enforcement (max 3 resales, 25% markup)
- **IPFS decentralized storage** for images and metadata
- **Program Derived Addresses** for deterministic ticket accounts
- **Ed25519 cryptographic signatures** for wallet authentication
- **On-chain state management** with 93-byte ticket accounts
- **Real transaction fees** and blockchain confirmations
- **Lamport-based pricing** with SOL to INR conversion

### ✅ Application Features
- **Multi-wallet support** (Phantom & MetaMask) with real signatures
- **Google OAuth integration** with JWT tokens
- **bcrypt password hashing** (10 salt rounds)
- **MySQL database** with memory fallback
- **Wallet-specific filtering** for ticket ownership
- **QR code verification** with mint addresses
- **Premium UI animations** with Three.js and GSAP
- **Dual currency display** (INR for users, SOL for blockchain)

### 🔒 Cryptographic Security Features
- **Ed25519 digital signatures** for wallet transactions
- **bcrypt password hashing** with 10 salt rounds
- **Smart contract ownership validation** on Solana blockchain
- **Program Derived Address** security (only program can modify)
- **Anti-scalping enforcement** via on-chain logic
- **IPFS content addressing** with SHA-256 hashing
- **JWT token authentication** for session management
- **Input validation** and SQL injection prevention
- **CORS protection** for API endpoints
- **Real blockchain confirmations** for transaction finality

## 🔍 Blockchain Verification

### **Live Smart Contract**
- **Program ID**: `Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw`
- **Network**: Solana Devnet
- **Explorer**: https://explorer.solana.com/address/Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw?cluster=devnet
- **Language**: Rust with Anchor Framework
- **Account Size**: 93 bytes per ticket

### **IPFS Storage**
- **Gateway**: `tan-tired-aphid-453.mypinata.cloud`
- **API**: Pinata v1 endpoints
- **Content Addressing**: SHA-256 based CIDs
- **Decentralization**: Distributed across IPFS network

### **Real Wallet Integration**
- **Phantom**: Solana native wallet with Ed25519 signatures
- **MetaMask**: Ethereum wallet (for future multi-chain support)
- **Keypair Format**: 64-byte secret key arrays
- **Address Format**: Base58 encoded public keys

## 📞 Technical Documentation

- **Repository**: https://github.com/NHR-09/eventix-blockchain-ticketing
- **Smart Contract**: `Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw` (Live on Solana Devnet)
- **Blockchain Network**: Solana Devnet (real transactions)
- **IPFS Gateway**: Pinata (decentralized storage)
- **NFT Standard**: Metaplex Token Metadata
- **Programming Languages**: Rust (smart contracts), JavaScript (services), HTML/CSS (frontend)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using real blockchain technology for the future of decentralized event ticketing**

*This is not a simulation - all NFTs are minted on live Solana blockchain with real cryptographic security*