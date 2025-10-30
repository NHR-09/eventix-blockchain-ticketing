# Eventix - Full Stack Solana Ticket Demo

A complete event ticketing system built on Solana with NFT minting, marketplace, and resale functionality.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start All Services
```bash
npm run full-demo
```

This will start:
- 🏭 Minting Service (Port 3002)
- 🔧 Backend API (Port 3001) 
- 🌐 Frontend (Port 8080)

### 3. Open Browser
Navigate to: http://localhost:8080

## 🎫 Demo Features

### Available Events
The system comes with 5 demo events:
- **VIP Concert Ticket** - 0.1 SOL
- **Music Fest 2025** - 0.08 SOL  
- **Standup Night** - 0.05 SOL
- **Art Expo** - 0.03 SOL
- **Sports Mania** - 0.12 SOL

### Core Functionality

#### 🛒 Buy Tickets
1. Connect your wallet (Phantom/MetaMask)
2. Browse events on the Events page
3. Click "Buy Ticket" 
4. Confirm purchase
5. Ticket is minted as NFT to your wallet

#### 🎟️ My Tickets
- View all your minted tickets
- See QR codes for each ticket
- Check ticket status (Owned/Listed)

#### 💰 Resale Market
- List your tickets for resale
- Set custom prices
- Buy tickets from other users
- All transactions logged in terminal

#### 🔄 Marketplace
- Browse resale tickets
- Compare prices with original
- Purchase from other users
- Real-time updates

## 🖥️ Terminal Logging

All actions are logged to the terminal with detailed information:

```
🎫 Processing ticket purchase request...
   Ticket type requested: concert-vip
   ✅ Valid ticket: VIP Concert Ticket - 0.1 SOL
   🔄 Calling minting service...
   📝 Mint result: { success: true, mintAddress: 'DEMO123...' }
   ✅ Ticket stored! Total tickets: 1
```

## 🏗️ Architecture

### Services
- **Frontend (Eventix)**: React-like vanilla JS interface
- **Backend API**: Express.js server handling ticket operations
- **Minting Service**: Mock Solana NFT minting service

### API Endpoints
- `POST /buy-ticket` - Purchase new ticket
- `POST /list-ticket` - List ticket for resale  
- `POST /buy-from-marketplace` - Buy from marketplace
- `GET /my-tickets` - Get user's tickets
- `GET /available-tickets` - Get available events
- `GET /marketplace` - Get marketplace listings

## 🔧 Manual Setup (Alternative)

If the quick start doesn't work, run services individually:

### Terminal 1 - Minting Service
```bash
cd minting-service
npm install
npm start
```

### Terminal 2 - Backend
```bash
cd backend  
npm install
npm start
```

### Terminal 3 - Frontend
```bash
npx http-server eventix -p 8080 -c-1
```

## 🎮 Testing the Demo

1. **Connect Wallet**: Use the demo wallet connection
2. **Buy Tickets**: Purchase different event types
3. **Check My Tickets**: View your NFT tickets with QR codes
4. **List for Resale**: Set custom resale prices
5. **Browse Marketplace**: See and buy resale tickets
6. **Monitor Logs**: Watch all transactions in terminal

## 🔍 Key Features Demonstrated

- ✅ NFT Ticket Minting
- ✅ Wallet Integration (Phantom/MetaMask)
- ✅ Real-time Marketplace
- ✅ Resale Functionality  
- ✅ QR Code Generation
- ✅ Transaction Logging
- ✅ Price Comparison
- ✅ Ownership Transfer
- ✅ Event Management

## 🛠️ Troubleshooting

### Port Issues
If ports are in use, the system will try alternatives:
- Backend: 3001 → 3003
- Frontend: 8080 → 8081

### Service Not Starting
1. Check if all dependencies are installed
2. Ensure ports are available
3. Check terminal for error messages

### Wallet Connection Issues
- Make sure you have Phantom or MetaMask installed
- Use the demo wallet feature if needed

## 📱 Mobile Responsive
The interface works on mobile devices and tablets.

## 🔐 Security Features
- Wallet verification required for purchases
- Transaction signatures
- Ownership validation
- Resale price limits (configurable)

---

**🎉 Enjoy testing the full Solana ticket marketplace!**

All transactions are logged to the terminal for easy monitoring and debugging.