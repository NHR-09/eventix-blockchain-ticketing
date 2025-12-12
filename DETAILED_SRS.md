# EVENTIX - COMPREHENSIVE SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## 1. INTRODUCTION

### 1.1 Purpose
This document provides a comprehensive specification for Eventix, a blockchain-based event ticketing platform that utilizes Solana NFTs, smart contracts, and IPFS for secure, anti-scalping ticket management.

### 1.2 Scope
Eventix is a full-stack decentralized application (dApp) that enables:
- Real NFT ticket minting on Solana blockchain
- Anti-scalping enforcement through smart contracts
- Decentralized metadata storage via IPFS
- Multi-wallet integration (Phantom & MetaMask)
- Secure marketplace for ticket resales
- Real-time blockchain data visualization

### 1.3 System Overview
The platform consists of four main components:
1. **Frontend** (HTML/CSS/JavaScript) - User interface
2. **Backend** (Node.js/Express) - API server and business logic
3. **Minting Service** (Node.js) - Blockchain integration
4. **Smart Contract** (Rust/Anchor) - On-chain anti-scalping logic

## 2. SYSTEM ARCHITECTURE

### 2.1 Technology Stack

#### Frontend Technologies
- **HTML5/CSS3** - Modern web standards with responsive design
- **JavaScript ES6+** - Client-side logic and wallet integration
- **Anime.js** - Smooth animations and transitions
- **Three.js** - 3D particle effects and visual enhancements
- **QRious** - QR code generation for ticket verification

#### Backend Technologies
- **Node.js v16+** - Server runtime environment
- **Express.js** - RESTful API framework
- **MySQL** - Relational database with memory fallback
- **bcrypt** - Password hashing (10 salt rounds)
- **JWT** - Token-based authentication
- **CORS** - Cross-origin resource sharing

#### Blockchain Technologies
- **Solana Devnet** - Live blockchain network (400ms block time)
- **Anchor Framework** - Rust-based smart contract development
- **Rust** - Systems programming for on-chain logic
- **Metaplex Protocol** - NFT standard with metadata support
- **Ed25519** - Elliptic curve digital signatures
- **Program Derived Addresses (PDAs)** - Deterministic account generation

#### Storage & Infrastructure
- **IPFS/Pinata** - Decentralized content-addressed storage
- **SHA-256** - Cryptographic hashing for content verification
- **Phantom Wallet** - Solana native wallet integration
- **MetaMask** - Ethereum wallet (future multi-chain support)

### 2.2 System Components

#### 2.2.1 Frontend Layer (`eventix/`)
```
eventix/
├── index.html              # Landing page with hero video
├── events.html             # Event listing and marketplace
├── mytickets.html          # User ticket management
├── getstarted.html         # Authentication interface
├── about.html              # Information page
├── style.css               # Main stylesheet
├── cinematic-style.css     # Animation styles
├── includes.js             # Shared components
├── auth.js                 # Authentication logic
├── currency-utils.js       # SOL/INR conversion utilities
├── assets/                 # Media files
│   ├── images/             # Event and UI images
│   ├── icons/              # Social media icons
│   └── videos/             # Background videos
└── data/
    └── events.json         # Event configuration data
```

#### 2.2.2 Backend Layer (`backend/`)
```
backend/
├── server.js               # Express API server
├── database.js             # MySQL connection and queries
├── package.json            # Dependencies
└── package-lock.json       # Dependency lock
```

#### 2.2.3 Blockchain Layer (`minting-service/`)
```
minting-service/
├── minting-server.js       # Solana NFT minting service
├── package.json            # Blockchain dependencies
└── package-lock.json       # Dependency lock
```

#### 2.2.4 Smart Contract Layer (`programs/`)
```
programs/
└── ticket_market/
    └── src/
        └── lib.rs          # Rust smart contract
```

#### 2.2.5 Configuration Files
```
├── .env                    # Environment variables
├── Anchor.toml             # Solana program configuration
├── start-local.js          # Service orchestrator
└── utils/
    └── demo-keypair.json   # Ed25519 keypair for transactions
```

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 User Authentication System

#### 3.1.1 Traditional Authentication
- **Registration**: Email/password with bcrypt hashing
- **Login**: JWT token generation and validation
- **Session Management**: Persistent login state

#### 3.1.2 Google OAuth Integration
- **Single Sign-On**: Google credential verification
- **Automatic Registration**: New user creation from Google data
- **Profile Management**: User data synchronization

#### 3.1.3 Wallet Authentication
- **Phantom Wallet**: Solana native wallet connection
- **MetaMask**: Ethereum wallet integration
- **Ed25519 Signatures**: Cryptographic transaction signing
- **Multi-wallet Support**: Seamless switching between wallets

### 3.2 Event Management System

#### 3.2.1 Event Display
- **Dynamic Loading**: Events from JSON configuration
- **Responsive Grid**: Auto-fit layout for different screen sizes
- **Image Carousel**: 9 event images with auto-rotation
- **Price Display**: Dual currency (INR/SOL) formatting

#### 3.2.2 Event Data Structure
```json
{
  "id": "unique_identifier",
  "title": "Event Name",
  "venue": "Location",
  "date": "YYYY-MM-DD",
  "price": "X.XXX SOL",
  "priceINR": 15000,
  "image": "path/to/image.jpg",
  "category": "concert|comedy|sports|exhibition"
}
```

### 3.3 NFT Ticket Minting System

#### 3.3.1 Real Blockchain Integration
- **Solana Devnet**: Live blockchain network deployment
- **Program ID**: `Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw`
- **Metaplex Protocol**: NFT standard compliance
- **IPFS Storage**: Decentralized metadata and image storage

#### 3.3.2 Minting Process Flow
1. **User Selection**: Choose event and connect wallet
2. **Payment Validation**: Verify sufficient SOL balance
3. **Image Upload**: Store ticket image on IPFS
4. **Metadata Creation**: Generate JSON metadata with IPFS CID
5. **NFT Minting**: Create NFT using Metaplex protocol
6. **Smart Contract**: Create on-chain ticket with anti-scalping rules
7. **Database Storage**: Store ticket metadata and ownership
8. **QR Generation**: Create verification QR code

#### 3.3.3 Ticket Metadata Structure
```json
{
  "name": "Event Ticket",
  "symbol": "TICKET",
  "description": "Event details with date, seat, price",
  "image": "https://gateway.pinata.cloud/ipfs/CID",
  "attributes": [
    {"trait_type": "Event Date", "value": "2024-12-25"},
    {"trait_type": "Seat", "value": "GA-001"},
    {"trait_type": "Price", "value": "0.1 SOL"}
  ]
}
```

### 3.4 Anti-Scalping Smart Contract

#### 3.4.1 On-Chain Data Structure (93 bytes)
```rust
pub struct Ticket {
    pub owner: Pubkey,        // 32 bytes - Current owner
    pub price: u64,           // 8 bytes - Current price in lamports
    pub resale_allowed: bool, // 1 byte - Can be resold
    pub max_markup: u8,       // 1 byte - Maximum markup percentage (25%)
    pub original_price: u64,  // 8 bytes - Original mint price
    pub is_listed: bool,      // 1 byte - Currently for sale
    pub mint: Pubkey,         // 32 bytes - NFT mint address
    pub has_been_sold: bool,  // 1 byte - Ever been sold
    pub sale_count: u8,       // 1 byte - Number of resales (max 3)
}
```

#### 3.4.2 Anti-Scalping Rules
- **Maximum Resales**: 3 resales per ticket
- **Price Markup Limit**: 25% above original price
- **Ownership Validation**: Only owner can list for sale
- **Automatic Enforcement**: Smart contract validation

#### 3.4.3 Smart Contract Functions
```rust
// Create new ticket with anti-scalping rules
pub fn create_ticket(
    ctx: Context<CreateTicket>, 
    price: u64, 
    resale_allowed: bool, 
    max_markup: u8, 
    mint: Pubkey
) -> Result<()>

// List ticket for resale with validation
pub fn list_ticket(
    ctx: Context<ListTicket>, 
    new_price: u64
) -> Result<()>

// Transfer ticket ownership
pub fn buy_ticket(
    ctx: Context<BuyTicket>
) -> Result<()>
```

### 3.5 Marketplace System

#### 3.5.1 Ticket Listing
- **Owner Verification**: Only ticket owner can list
- **Price Validation**: Enforce 25% markup limit
- **Resale Tracking**: Count and limit resales
- **Smart Contract Integration**: On-chain listing state

#### 3.5.2 Marketplace Display
- **Listed Tickets**: Show available resale tickets
- **Price Comparison**: Original vs current price
- **Resale History**: Track previous sales
- **Real-time Updates**: 30-second refresh interval

#### 3.5.3 Purchase Process
- **Wallet Verification**: Buyer must have connected wallet
- **Transaction Signing**: Multi-signature requirement
- **Ownership Transfer**: Update both blockchain and database
- **History Recording**: Log all resale transactions

### 3.6 Blockchain Data Visualization

#### 3.6.1 Spotlight Popup System
- **Modern UI**: Card-based design with hover effects
- **Mouse Tracking**: Radial gradient follows cursor
- **Responsive Layout**: Grid-based information display
- **Loading States**: Prevent multiple clicks during API calls

#### 3.6.2 Ticket Lifecycle Display
- **Current State**: Owner, price, listing status
- **Price Analysis**: Markup calculation and compliance
- **Resale Information**: Count and availability
- **Anti-Scalping Status**: Rule enforcement display
- **Blockchain Data**: Transaction count and minting status

#### 3.6.3 Transaction History
- **Complete History**: Both NFT and smart contract transactions
- **Status Indicators**: Success/failure with color coding
- **Explorer Links**: Direct links to Solana Explorer
- **Chronological Order**: Newest transactions first

### 3.7 Currency Management

#### 3.7.1 Dual Currency System
- **Display Currency**: Indian Rupees (INR) for user interface
- **Blockchain Currency**: Solana (SOL) for transactions
- **Exchange Rate**: 1 SOL = ₹15,000 (configurable)
- **Real-time Conversion**: Automatic price calculations

#### 3.7.2 Price Formatting
```javascript
// INR formatting: ₹15,000
function formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// SOL formatting: 1.000 SOL
function formatSOL(amount) {
  return `${amount.toFixed(3)} SOL`;
}

// Dual display: ₹15,000 (1.000 SOL)
function formatDualPrice(solAmount) {
  const inrAmount = solToInr(solAmount);
  return `${formatINR(inrAmount)} (${formatSOL(solAmount)})`;
}
```

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance Requirements

#### 4.1.1 Response Times
- **Page Load**: < 3 seconds for initial load
- **API Responses**: < 2 seconds for database queries
- **Blockchain Queries**: < 5 seconds for on-chain data
- **NFT Minting**: < 30 seconds for complete process

#### 4.1.2 Throughput
- **Concurrent Users**: Support 100+ simultaneous users
- **Transaction Processing**: Handle 10+ minting operations per minute
- **Database Operations**: 1000+ queries per minute
- **IPFS Uploads**: 50+ file uploads per hour

### 4.2 Security Requirements

#### 4.2.1 Authentication Security
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Secure token generation and validation
- **Session Management**: Automatic timeout and refresh
- **Input Validation**: Sanitization of all user inputs

#### 4.2.2 Blockchain Security
- **Ed25519 Signatures**: Cryptographic transaction signing
- **Smart Contract Validation**: On-chain ownership verification
- **PDA Security**: Program-controlled account access
- **Anti-Scalping Enforcement**: Immutable price and resale limits

#### 4.2.3 Data Security
- **HTTPS Encryption**: All API communications encrypted
- **CORS Protection**: Restricted cross-origin requests
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and output encoding

### 4.3 Reliability Requirements

#### 4.3.1 Availability
- **Uptime Target**: 99.5% availability
- **Fault Tolerance**: Graceful degradation on service failures
- **Error Handling**: Comprehensive error messages and recovery
- **Backup Systems**: Database and configuration backups

#### 4.3.2 Data Integrity
- **Blockchain Immutability**: Permanent transaction records
- **IPFS Persistence**: Decentralized content storage
- **Database Consistency**: ACID transaction properties
- **Backup Verification**: Regular data integrity checks

### 4.4 Scalability Requirements

#### 4.4.1 Horizontal Scaling
- **Microservice Architecture**: Independent service scaling
- **Load Balancing**: Distribute traffic across instances
- **Database Sharding**: Partition data for performance
- **CDN Integration**: Global content delivery

#### 4.4.2 Vertical Scaling
- **Resource Optimization**: Efficient memory and CPU usage
- **Caching Strategies**: Redis for frequently accessed data
- **Connection Pooling**: Database connection management
- **Async Processing**: Non-blocking I/O operations

### 4.5 Usability Requirements

#### 4.5.1 User Interface
- **Responsive Design**: Mobile and desktop compatibility
- **Accessibility**: WCAG 2.1 AA compliance
- **Intuitive Navigation**: Clear user flow and feedback
- **Loading Indicators**: Visual feedback for long operations

#### 4.5.2 User Experience
- **Onboarding**: Guided wallet connection process
- **Error Messages**: Clear, actionable error descriptions
- **Help Documentation**: Comprehensive user guides
- **Multi-language Support**: Internationalization ready

## 5. SYSTEM INTERFACES

### 5.1 External APIs

#### 5.1.1 Solana RPC API
- **Endpoint**: `https://api.devnet.solana.com`
- **Purpose**: Blockchain interaction and transaction submission
- **Authentication**: None (public endpoint)
- **Rate Limits**: Standard Solana RPC limits

#### 5.1.2 Pinata IPFS API
- **Endpoint**: `https://api.pinata.cloud`
- **Purpose**: Decentralized file and metadata storage
- **Authentication**: JWT Bearer token
- **Rate Limits**: Based on subscription plan

#### 5.1.3 Google OAuth API
- **Endpoint**: `https://accounts.google.com`
- **Purpose**: User authentication and profile data
- **Authentication**: OAuth 2.0 flow
- **Scopes**: Profile and email access

### 5.2 Internal APIs

#### 5.2.1 Backend API Endpoints
```
Authentication:
POST /api/register          - User registration
POST /api/login             - User login
POST /api/google-auth       - Google OAuth

Ticket Management:
POST /buy-ticket            - Purchase new ticket
POST /list-ticket           - List ticket for sale
POST /buy-from-marketplace  - Buy from resale market
GET  /my-tickets            - Get user's tickets
GET  /available-tickets     - Get available events
GET  /marketplace           - Get marketplace listings

Blockchain Integration:
POST /mint                  - Mint NFT ticket
POST /list                  - List on smart contract
POST /transfer              - Transfer NFT ownership
GET  /info/:mintAddress     - Get ticket information
GET  /lifecycle/:mintAddress - Get complete lifecycle
```

#### 5.2.2 Database Schema
```sql
-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
    id VARCHAR(255) PRIMARY KEY,
    mint VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date VARCHAR(255),
    price DECIMAL(10,6) NOT NULL,
    original_price DECIMAL(10,6) NOT NULL,
    image VARCHAR(500),
    is_listed BOOLEAN DEFAULT FALSE,
    owner VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resale history table
CREATE TABLE resale_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id VARCHAR(255) NOT NULL,
    from_wallet VARCHAR(255) NOT NULL,
    to_wallet VARCHAR(255) NOT NULL,
    price DECIMAL(10,6) NOT NULL,
    resale_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(mint)
);
```

### 5.3 Wallet Interfaces

#### 5.3.1 Phantom Wallet Integration
```javascript
// Connection
const resp = await window.solana.connect();
const publicKey = resp.publicKey.toString();

// Transaction signing
const signedTransaction = await window.solana.signTransaction(transaction);
const signature = await connection.sendRawTransaction(signedTransaction.serialize());
```

#### 5.3.2 MetaMask Integration
```javascript
// Connection
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});

// Future multi-chain support
const chainId = await window.ethereum.request({
  method: 'eth_chainId'
});
```

## 6. IMPLEMENTATION DETAILS

### 6.1 Development Environment

#### 6.1.1 Prerequisites
- **Node.js**: v16+ with npm package manager
- **MySQL**: v8.0+ database server
- **Rust**: Latest stable with Cargo
- **Solana CLI**: v1.14+ with Anchor framework
- **Git**: Version control system

#### 6.1.2 Installation Process
```bash
# Clone repository
git clone <repository-url>
cd solana-ticket-proto-main

# Install dependencies
npm install
cd eventix && npm install && cd ..
cd backend && npm install && cd ..
cd minting-service && npm install && cd ..

# Database setup
mysql -u root -p
CREATE DATABASE eventix_db;

# Environment configuration
cp .env.example .env
# Edit .env with your configuration

# Start services
npm run start-all
```

#### 6.1.3 Service Ports
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Minting Service**: http://localhost:3002
- **MySQL Database**: localhost:3306

### 6.2 Deployment Architecture

#### 6.2.1 Local Development
- **Service Orchestration**: `start-local.js` manages all services
- **Hot Reloading**: Automatic restart on file changes
- **Debug Logging**: Comprehensive console output
- **Error Handling**: Graceful service recovery

#### 6.2.2 Production Considerations
- **Environment Variables**: Secure configuration management
- **SSL Certificates**: HTTPS encryption for all endpoints
- **Load Balancing**: Nginx reverse proxy configuration
- **Monitoring**: Application performance monitoring
- **Backup Strategy**: Automated database and file backups

### 6.3 Testing Strategy

#### 6.3.1 Unit Testing
- **Backend Functions**: API endpoint testing
- **Smart Contract**: Rust unit tests with Anchor
- **Frontend Components**: JavaScript function testing
- **Database Operations**: SQL query validation

#### 6.3.2 Integration Testing
- **API Integration**: End-to-end API flow testing
- **Blockchain Integration**: Solana devnet transaction testing
- **Wallet Integration**: Multi-wallet compatibility testing
- **IPFS Integration**: File upload and retrieval testing

#### 6.3.3 User Acceptance Testing
- **User Flows**: Complete ticket purchase and resale flows
- **Cross-browser Testing**: Chrome, Firefox, Safari compatibility
- **Mobile Testing**: Responsive design validation
- **Performance Testing**: Load testing with multiple users

## 7. MAINTENANCE AND SUPPORT

### 7.1 Monitoring and Logging

#### 7.1.1 Application Monitoring
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Metrics**: Response time and throughput monitoring
- **User Analytics**: Usage patterns and feature adoption
- **System Health**: Service availability and resource usage

#### 7.1.2 Blockchain Monitoring
- **Transaction Status**: Success/failure rate tracking
- **Gas Usage**: Transaction cost optimization
- **Smart Contract Events**: On-chain activity monitoring
- **Network Health**: Solana network status monitoring

### 7.2 Backup and Recovery

#### 7.2.1 Data Backup
- **Database Backup**: Daily automated MySQL dumps
- **Configuration Backup**: Environment and deployment configs
- **Code Repository**: Git-based version control
- **IPFS Redundancy**: Multiple gateway configurations

#### 7.2.2 Disaster Recovery
- **Service Recovery**: Automated service restart procedures
- **Data Recovery**: Point-in-time database restoration
- **Blockchain Recovery**: Transaction replay capabilities
- **Failover Procedures**: Alternative service endpoints

### 7.3 Updates and Upgrades

#### 7.3.1 Software Updates
- **Dependency Management**: Regular security updates
- **Feature Releases**: Staged deployment process
- **Bug Fixes**: Hotfix deployment procedures
- **Performance Optimizations**: Continuous improvement

#### 7.3.2 Blockchain Updates
- **Smart Contract Upgrades**: Anchor program updates
- **Network Migrations**: Mainnet deployment preparation
- **Protocol Updates**: Solana and Metaplex compatibility
- **Security Patches**: Critical vulnerability fixes

## 8. COMPLIANCE AND REGULATIONS

### 8.1 Data Protection

#### 8.1.1 Privacy Compliance
- **GDPR Compliance**: European data protection regulations
- **Data Minimization**: Collect only necessary user data
- **User Consent**: Explicit consent for data processing
- **Right to Deletion**: User data removal capabilities

#### 8.1.2 Security Standards
- **Encryption**: AES-256 for data at rest
- **Transport Security**: TLS 1.3 for data in transit
- **Access Control**: Role-based permission system
- **Audit Logging**: Comprehensive activity tracking

### 8.2 Financial Regulations

#### 8.2.1 Anti-Money Laundering (AML)
- **Transaction Monitoring**: Suspicious activity detection
- **User Verification**: KYC procedures for high-value transactions
- **Reporting**: Regulatory compliance reporting
- **Record Keeping**: Transaction history maintenance

#### 8.2.2 Consumer Protection
- **Transparent Pricing**: Clear fee disclosure
- **Refund Policies**: Event cancellation procedures
- **Dispute Resolution**: Customer support processes
- **Terms of Service**: Legal compliance documentation

## 9. FUTURE ENHANCEMENTS

### 9.1 Planned Features

#### 9.1.1 Multi-Chain Support
- **Ethereum Integration**: ERC-721 NFT compatibility
- **Polygon Network**: Layer 2 scaling solution
- **Cross-Chain Bridges**: Asset transfer capabilities
- **Universal Wallet**: Multi-chain wallet support

#### 9.1.2 Advanced Features
- **Dynamic Pricing**: AI-powered price optimization
- **Social Features**: User reviews and ratings
- **Mobile App**: Native iOS and Android applications
- **API Marketplace**: Third-party integration platform

### 9.2 Scalability Improvements

#### 9.2.1 Performance Optimization
- **Caching Layer**: Redis implementation
- **Database Optimization**: Query performance tuning
- **CDN Integration**: Global content delivery
- **Microservices**: Service decomposition

#### 9.2.2 Infrastructure Scaling
- **Kubernetes**: Container orchestration
- **Auto-scaling**: Dynamic resource allocation
- **Multi-region**: Global deployment strategy
- **Edge Computing**: Distributed processing

## 10. CONCLUSION

Eventix represents a comprehensive blockchain-based ticketing solution that addresses the critical issues of ticket fraud and scalping through innovative use of Solana blockchain technology, smart contracts, and decentralized storage. The system provides a secure, transparent, and user-friendly platform for event ticketing while maintaining high performance and scalability standards.

The implementation demonstrates real blockchain integration with live NFT minting, anti-scalping enforcement, and comprehensive user experience design. The modular architecture ensures maintainability and extensibility for future enhancements and scaling requirements.

This SRS document serves as the definitive guide for understanding, maintaining, and extending the Eventix platform, providing detailed technical specifications and implementation guidelines for all system components.