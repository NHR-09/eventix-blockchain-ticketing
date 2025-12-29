import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setGlobalDispatcher, Agent } from 'undici';
import axios from 'axios';
import FormData from 'form-data';
import {
  Connection,
  LAMPORTS_PER_SOL,
  Keypair,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';

const LAMPORTS_PER_SOL_CONST = 1_000_000_000;
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, generateSigner } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import {
  mplTokenMetadata,
  createNft,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';
import * as anchor from '@project-serum/anchor';
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

setGlobalDispatcher(
  new Agent({
    connect: { timeout: 60000, keepAlive: true },
    headersTimeout: 60000,
    bodyTimeout: 60000,
    maxRedirections: 3,
    retry: { limit: 3, methods: ['GET', 'POST'] }
  })
);

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const CLUSTER = process.env.CLUSTER;
const RPC_URL = process.env.RPC_URL;
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY;
const KEYPAIR_PATH = process.env.KEYPAIR_PATH;
const ORGANIZER_PUBLIC_KEY = process.env.ORGANIZER_PUBLIC_KEY || process.env.dummykey;
// Load program ID from IDL file but use compatible structure
const idlPath = path.join(__dirname, '../target/idl/ticket_market.json');
const originalIDL = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
const PROGRAM_ID = new PublicKey('Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw');

// Use Anchor 0.24.2 compatible IDL structure
const IDL = {
  version: '0.1.0',
  name: 'ticket_market',
  programId: 'Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw',
  instructions: [
    {
      name: 'createTicket',
      accounts: [
        { name: 'ticket', isMut: true, isSigner: false },
        { name: 'organizer', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: [
        { name: 'price', type: 'u64' },
        { name: 'resaleAllowed', type: 'bool' },
        { name: 'maxMarkup', type: 'u8' },
        { name: 'mint', type: 'publicKey' }
      ]
    }
  ],
  accounts: [
    {
      name: 'ticket',
      type: {
        kind: 'struct',
        fields: [
          { name: 'owner', type: 'publicKey' },
          { name: 'price', type: 'u64' },
          { name: 'resaleAllowed', type: 'bool' },
          { name: 'maxMarkup', type: 'u8' },
          { name: 'originalPrice', type: 'u64' },
          { name: 'isListed', type: 'bool' },
          { name: 'mint', type: 'publicKey' }
        ]
      }
    }
  ]
};

console.log('🔧 Configuration loaded:');
console.log(`   Cluster: ${CLUSTER}`);
console.log(`   RPC URL: ${RPC_URL}`);
console.log(`   Keypair: ${KEYPAIR_PATH}`);
console.log(`   Program ID: ${PROGRAM_ID.toBase58()}`);

function readKeypairFromFile(filePath) {
  try {
    console.log(`📁 Reading keypair from: ${filePath}`);
    const secret = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(secret) || secret.length !== 64) {
      throw new Error('Invalid keypair format');
    }
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  } catch (e) {
    throw new Error(`Failed to read keypair: ${e.message}`);
  }
}

async function createRobustConnection(rpcUrl) {
  console.log('🔗 Creating connection to:', rpcUrl);
  const connection = new Connection(rpcUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 120000,
  });
  const slot = await connection.getSlot();
  console.log(`  ✅ Connected successfully! Current slot: ${slot}`);
  return connection;
}

async function ensureSufficientBalance(connection, publicKey, minBalance = 0.01) {
  console.log('💰 Checking balance...');
  const lamports = await connection.getBalance(publicKey);
  const sol = lamports / LAMPORTS_PER_SOL;
  console.log(`  📊 Current balance: ${sol.toFixed(4)} SOL`);
  
  if (sol < minBalance) {
    throw new Error(`REAL MODE REQUIRES ${minBalance} SOL. Current: ${sol.toFixed(4)} SOL`);
  }
}

async function uploadToIPFS(filePath, fileName = 'ticket.png') {
  if (!PINATA_JWT) throw new Error('PINATA_JWT not set in environment.');
  console.log('🌐 Uploading file to Pinata:', filePath);

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('pinataMetadata', JSON.stringify({ name: fileName }));

  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    timeout: 60000,
  });

  const cid = res?.data?.IpfsHash;
  if (!cid) throw new Error(`Pinata response missing IpfsHash`);

  const url = `https://${PINATA_GATEWAY}/ipfs/${cid}`;
  console.log('  ✅ Pinata file upload successful:', url);
  return url;
}

async function uploadJSONToIPFS(metadata, fileName = 'metadata.json') {
  if (!PINATA_JWT) throw new Error('PINATA_JWT not set in environment.');

  console.log('📄 Uploading JSON metadata to Pinata...');
  
  const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    pinataContent: metadata,
    pinataMetadata: { name: fileName }
  }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    timeout: 60000,
  });

  const cid = res?.data?.IpfsHash;
  if (!cid) throw new Error(`Pinata response missing IpfsHash`);

  const url = `https://${PINATA_GATEWAY}/ipfs/${cid}`;
  console.log('  ✅ Pinata metadata upload successful:', url);
  return url;
}

async function createSmartContractTicket(connection, wallet, mintAddress, price) {
  console.log('🔗 Creating smart contract ticket...');
  
  const mintPubkey = new PublicKey(mintAddress);
  const [ticketPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('ticket'), wallet.publicKey.toBuffer(), mintPubkey.toBuffer()],
    PROGRAM_ID
  );
  
  console.log('  📍 Ticket PDA:', ticketPda.toBase58());
  
  // Create instruction data for create_ticket (original format)
  const instructionData = Buffer.alloc(8 + 8 + 1 + 1 + 32);
  let offset = 0;
  
  // Instruction discriminator for create_ticket
  const discriminator = Buffer.from([16, 178, 122, 25, 213, 85, 96, 129]);
  discriminator.copy(instructionData, offset);
  offset += 8;
  
  // Price (u64)
  const priceBuffer = Buffer.alloc(8);
  const priceInLamports = Math.floor(price * LAMPORTS_PER_SOL);
  priceBuffer.writeBigUInt64LE(BigInt(priceInLamports), 0);
  priceBuffer.copy(instructionData, offset);
  offset += 8;
  
  // Resale allowed (bool)
  instructionData.writeUInt8(1, offset);
  offset += 1;
  
  // Max markup (u8) - 25% max markup
  instructionData.writeUInt8(25, offset);
  offset += 1;
  
  // Mint address (32 bytes)
  mintPubkey.toBuffer().copy(instructionData, offset);
  
  console.log('  🔧 Creating ticket with existing program (93 bytes total)');
  
  const instruction = {
    keys: [
      { pubkey: ticketPda, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data: instructionData
  };
  
  const transaction = new anchor.web3.Transaction().add(instruction);
  const signature = await connection.sendTransaction(transaction, [wallet]);
  await connection.confirmTransaction(signature);
  
  console.log('  ✅ Smart contract ticket created:', signature);
  return { ticketPda: ticketPda.toBase58(), signature };
}

async function mintTicketWithSmartContract({
  imagePath,
  name,
  description,
  eventDate,
  seat,
  price,
}) {
  console.log('🎫 Starting integrated NFT + Smart Contract minting...');

  const solKeypair = readKeypairFromFile(KEYPAIR_PATH);
  console.log('👤 Wallet loaded. Public key:', solKeypair.publicKey.toBase58());

  const connection = await createRobustConnection(RPC_URL);
  await ensureSufficientBalance(connection, solKeypair.publicKey, 0.05);

  console.log('⚙️ Setting up UMI for NFT minting...');
  const umi = createUmi(RPC_URL).use(mplTokenMetadata());
  const umiKeypair = fromWeb3JsKeypair(solKeypair);
  umi.use(keypairIdentity(umiKeypair));

  const imageUri = await uploadToIPFS(imagePath);

  const metadata = {
    name,
    symbol: 'TICKET',
    description: `${description}\nEvent: ${eventDate}\nSeat: ${seat}\nPrice: ${price} SOL`,
    image: imageUri,
    attributes: [
      { trait_type: 'Event Date', value: eventDate },
      { trait_type: 'Seat', value: seat },
      { trait_type: 'Price', value: `${price} SOL` },
    ],
  };

  const metadataUri = await uploadJSONToIPFS(metadata);
  const mint = generateSigner(umi);
  console.log('🏷️ Generated mint address:', mint.publicKey.toString());

  console.log('1️⃣ Creating NFT...');
  const nftResult = await createNft(umi, {
    mint,
    name,
    symbol: 'TICKET',
    uri: metadataUri,
    sellerFeeBasisPoints: 500,
    creators: [{ address: umi.identity.publicKey, verified: true, share: 100 }],
    tokenStandard: TokenStandard.NonFungible,
  }).sendAndConfirm(umi);

  const nftSignature = Array.isArray(nftResult.signature) 
    ? Buffer.from(nftResult.signature).toString('base64')
    : nftResult.signature.toString();

  console.log('  ✅ NFT created successfully!');

  console.log('2️⃣ Creating smart contract ticket...');
  const smartContractResult = await createSmartContractTicket(
    connection,
    solKeypair,
    mint.publicKey.toString(),
    price
  );

  console.log('✅ FULL TICKET CREATION SUCCESSFUL!');
  console.log('📋 TICKET DETAILS:');
  console.log('   NFT Mint:', mint.publicKey.toString());
  console.log('   Smart Contract PDA:', smartContractResult.ticketPda);
  console.log('   NFT Transaction:', nftSignature);
  console.log('   Smart Contract Transaction:', smartContractResult.signature);
  console.log('   Image URI:', imageUri);
  console.log('   Metadata URI:', metadataUri);

  return {
    mintAddress: mint.publicKey.toString(),
    ticketPda: smartContractResult.ticketPda,
    nftSignature,
    smartContractSignature: smartContractResult.signature,
    imageUri,
    metadataUri,
  };
}

app.post('/mint', async (req, res) => {
  try {
    const { name, description, eventDate, seat, price } = req.body;
    console.log(`🎫 REAL NFT MINTING: ${name}`);
    
    const assetPath = path.join(__dirname, '../assets/ticket.png');
    
    if (!fs.existsSync(assetPath)) {
      const assetsDir = path.dirname(assetPath);
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      fs.writeFileSync(assetPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'));
    }
    
    const result = await mintTicketWithSmartContract({
      imagePath: assetPath,
      name,
      description,
      eventDate,
      seat,
      price,
    });
    
    console.log('✅ REAL SMART CONTRACT MINTING SUCCESSFUL!');
    res.json({ success: true, ...result });
    
  } catch (error) {
    console.error('❌ REAL MINTING FAILED:', error.message);
    res.json({ success: false, error: `Real minting failed: ${error.message}` });
  }
});

app.post('/list', async (req, res) => {
  try {
    const { mintAddress, price } = req.body;
    console.log(`📝 REAL SMART CONTRACT LISTING: ${mintAddress} for ${price} SOL`);
    
    const solKeypair = readKeypairFromFile(KEYPAIR_PATH);
    const connection = await createRobustConnection(RPC_URL);
    
    const mintPubkey = new PublicKey(mintAddress);
    const [ticketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('ticket'), solKeypair.publicKey.toBuffer(), mintPubkey.toBuffer()],
      PROGRAM_ID
    );
    
    // Create instruction data for list_ticket
    const instructionData = Buffer.alloc(8 + 8);
    let offset = 0;
    
    // Instruction discriminator for list_ticket (from IDL)
    const discriminator = Buffer.from([11, 213, 240, 45, 246, 35, 44, 162]);
    discriminator.copy(instructionData, offset);
    offset += 8;
    
    // New price (u64) - fix floating point precision
    const priceBuffer = Buffer.alloc(8);
    const priceInLamports = Math.floor(price * LAMPORTS_PER_SOL);
    priceBuffer.writeBigUInt64LE(BigInt(priceInLamports), 0);
    priceBuffer.copy(instructionData, offset);
    
    const instruction = {
      keys: [
        { pubkey: ticketPda, isSigner: false, isWritable: true },
        { pubkey: solKeypair.publicKey, isSigner: true, isWritable: false }
      ],
      programId: PROGRAM_ID,
      data: instructionData
    };
    
    const transaction = new anchor.web3.Transaction().add(instruction);
    const signature = await connection.sendTransaction(transaction, [solKeypair]);
    await connection.confirmTransaction(signature);
    
    console.log(`✅ REAL LISTING SUCCESSFUL: ${signature}`);
    res.json({ success: true, transaction: signature });
    
  } catch (error) {
    console.error('❌ REAL LISTING FAILED:', error.message);
    
    // Handle specific smart contract errors
    if (error.message.includes('ExceedsMaxMarkup')) {
      res.json({ success: false, error: 'Price exceeds maximum allowed markup of 25%. Please set a lower price.' });
    } else if (error.message.includes('NotTicketOwner')) {
      res.json({ success: false, error: 'You are not the owner of this ticket.' });
    } else if (error.message.includes('ResaleNotAllowed')) {
      res.json({ success: false, error: 'This ticket cannot be resold.' });
    } else if (error.message.includes('TicketAlreadySold')) {
      res.json({ success: false, error: 'This ticket has already been sold once and cannot be resold again due to anti-scalping rules.' });
    } else {
      res.json({ success: false, error: error.message });
    }
  }
});

app.get('/info/:mintAddress', async (req, res) => {
  try {
    const { mintAddress } = req.params;
    console.log(`🔍 REAL SMART CONTRACT INFO: ${mintAddress}`);
    
    const solKeypair = readKeypairFromFile(KEYPAIR_PATH);
    const connection = await createRobustConnection(RPC_URL);
    
    const mintPubkey = new PublicKey(mintAddress);
    const [ticketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('ticket'), solKeypair.publicKey.toBuffer(), mintPubkey.toBuffer()],
      PROGRAM_ID
    );
    
    const accountInfo = await connection.getAccountInfo(ticketPda);
    if (!accountInfo) {
      return res.json({ success: false, error: 'Ticket not found' });
    }
    
    // Parse account data manually (simplified)
    const data = accountInfo.data;
    console.log('✅ REAL TICKET INFO RETRIEVED');
    res.json({
      success: true,
      ticket: {
        pda: ticketPda.toBase58(),
        mint: mintAddress,
        exists: true
      }
    });
    
  } catch (error) {
    console.error('❌ REAL INFO FAILED:', error.message);
    res.json({ success: false, error: error.message });
  }
});

app.post('/transfer', async (req, res) => {
  try {
    const { mintAddress, fromWallet, toWallet, price } = req.body;
    console.log(`🔄 REAL SMART CONTRACT TRANSFER: ${mintAddress}`);
    
    const solKeypair = readKeypairFromFile(KEYPAIR_PATH);
    const connection = await createRobustConnection(RPC_URL);
    
    const mintPubkey = new PublicKey(mintAddress);
    const fromPubkey = new PublicKey(fromWallet);
    const toPubkey = new PublicKey(toWallet);
    
    // Get ticket PDA (created by server keypair)
    const [ticketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('ticket'), solKeypair.publicKey.toBuffer(), mintPubkey.toBuffer()],
      PROGRAM_ID
    );
    
    console.log(`  📍 Ticket PDA: ${ticketPda.toBase58()}`);
    
    // Check ticket state for anti-scalping
    const ticketAccount = await connection.getAccountInfo(ticketPda);
    if (!ticketAccount) {
      throw new Error('Ticket not found on blockchain');
    }
    
    const ticketData = ticketAccount.data;
    
    // Parse anti-scalping fields
    if (ticketData.length >= 93) {
      let offset = 8 + 32 + 8 + 1 + 1 + 8 + 1 + 32;
      const saleCount = ticketData[offset + 1];
      
      if (saleCount >= 3) {
        throw new Error('MaxResalesExceeded');
      }
    }
    
    // Execute buy_ticket instruction
    const instructionData = Buffer.alloc(8);
    const discriminator = Buffer.from([11, 24, 17, 193, 168, 116, 164, 169]);
    discriminator.copy(instructionData, 0);
    
    const instruction = {
      keys: [
        { pubkey: ticketPda, isSigner: false, isWritable: true },
        { pubkey: fromPubkey, isSigner: true, isWritable: true }, // owner must sign
        { pubkey: toPubkey, isSigner: true, isWritable: true }, // buyer must sign
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId: PROGRAM_ID,
      data: instructionData
    };
    
    // Create transaction for frontend to sign
    const transaction = new anchor.web3.Transaction().add(instruction);
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = toPubkey; // buyer pays fees
    
    // Serialize transaction for frontend
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });
    
    res.json({ 
      success: true, 
      requiresSignature: true,
      transaction: serializedTransaction.toString('base64'),
      message: 'Transaction prepared for signing.'
    });
    
  } catch (error) {
    console.error('❌ SMART CONTRACT TRANSFER FAILED:', error.message);
    
    if (error.message.includes('TicketAlreadySold')) {
      res.json({ success: false, error: 'This ticket has already been sold and cannot be resold again due to anti-scalping rules.' });
    } else if (error.message.includes('MaxResalesExceeded')) {
      res.json({ success: false, error: 'Maximum number of resales (3) exceeded. This ticket cannot be resold anymore.' });
    } else {
      res.json({ success: false, error: error.message });
    }
  }
});

// Get complete ticket lifecycle
app.get('/lifecycle/:mintAddress', async (req, res) => {
  try {
    const { mintAddress } = req.params;
    console.log(`🔄 Getting complete lifecycle for: ${mintAddress}`);

    const connection = await createRobustConnection(RPC_URL);
    const mintPubkey = new PublicKey(mintAddress);

    // Helper to compute PDA given an organizer pubkey
    const computePda = (organizerPubkey) => {
      return PublicKey.findProgramAddressSync(
        [Buffer.from('ticket'), organizerPubkey.toBuffer(), mintPubkey.toBuffer()],
        PROGRAM_ID
      )[0];
    };

    // Use server keypair (consistent with minting)
    let ticketPda = null;
    try {
      const solKeypair = readKeypairFromFile(KEYPAIR_PATH);
      const serverPubkey = solKeypair.publicKey;
      const pda = computePda(serverPubkey);
      const info = await connection.getAccountInfo(pda);
      if (info) {
        console.log('Found ticket PDA using server keypair');
        ticketPda = pda;
      } else {
        console.log('No account at PDA computed from server keypair');
      }
    } catch (e) {
      console.log('Server keypair read failed:', e.message);
    }

    // Fallback: search program accounts by mint field if PDA not found
    if (!ticketPda) {
      console.log('Searching program accounts for ticket with this mint...');

      const mintFieldOffset = 8 + 51;
      const expectedSize = 8 + 93;

      const programAccounts = await connection.getProgramAccounts(PROGRAM_ID, {
        commitment: 'confirmed',
        filters: [
          { dataSize: expectedSize },
          { memcmp: { offset: mintFieldOffset, bytes: mintPubkey.toBase58() } }
        ]
      });

      if (programAccounts.length > 0) {
        ticketPda = programAccounts[0].pubkey;
        console.log('Found ticket account via program search:', ticketPda.toBase58());
      } else {
        console.log('No program accounts matched the mint.');
      }
    }

    if (!ticketPda) {
      return res.json({ success: false, error: 'Ticket not found on blockchain (no matching PDA/account)' });
    }

    // Read the account data now that we have ticketPda
    const accountInfo = await connection.getAccountInfo(ticketPda);
    if (!accountInfo) {
      return res.json({ success: false, error: 'Ticket account not found after PDA discovery' });
    }

    const data = accountInfo.data;

    // Parse according to Rust struct:
    // discriminator 8 bytes
    // owner: bytes 0..32
    // price: bytes 32..40
    // resale_allowed: byte 40
    // max_markup: byte 41
    // original_price: bytes 42..50
    // is_listed: byte 50
    // mint: bytes 51..83
    // has_been_sold: byte 83
    // sale_count: byte 84
    const owner = new PublicKey(data.slice(8 + 0, 8 + 32)).toString();
    const priceLamports = Number(data.readBigUInt64LE(8 + 32));
    const price = priceLamports / LAMPORTS_PER_SOL;
    const resaleAllowed = data[8 + 40] === 1;
    const maxMarkup = data[8 + 41];
    const originalPrice = Number(data.readBigUInt64LE(8 + 42)) / LAMPORTS_PER_SOL;
    const isListed = data[8 + 50] === 1;
    const mintFromData = new PublicKey(data.slice(8 + 51, 8 + 83)).toString();
    const hasBeenSold = data[8 + 83] === 1;
    const saleCount = data[8 + 84];

    // Get transaction history: include both PDAs and mint txs
    const history = [];

    // PDA (smart contract) transactions
    const pdaSignatures = await connection.getSignaturesForAddress(ticketPda, { limit: 20 });
    for (const sig of pdaSignatures) {
      const tx = await connection.getTransaction(sig.signature, { maxSupportedTransactionVersion: 0 });
      if (tx) {
        history.push({
          signature: sig.signature,
          blockTime: tx.blockTime,
          status: tx.meta?.err ? 'Failed' : 'Success',
          type: 'Smart Contract',
          explorerUrl: `https://explorer.solana.com/tx/${sig.signature}?cluster=${CLUSTER || 'devnet'}`
        });
      }
    }

    // Mint transactions
    const mintSignatures = await connection.getSignaturesForAddress(mintPubkey, { limit: 10 });
    for (const sig of mintSignatures) {
      const tx = await connection.getTransaction(sig.signature, { maxSupportedTransactionVersion: 0 });
      if (tx) {
        history.push({
          signature: sig.signature,
          blockTime: tx.blockTime,
          status: tx.meta?.err ? 'Failed' : 'Success',
          type: 'NFT Transaction',
          explorerUrl: `https://explorer.solana.com/tx/${sig.signature}?cluster=${CLUSTER || 'devnet'}`
        });
      }
    }

    // Sort by blockTime desc
    history.sort((a, b) => (b.blockTime || 0) - (a.blockTime || 0));

    const lifecycle = {
      currentState: {
        pda: ticketPda.toBase58(),
        owner,
        price,
        originalPrice,
        resaleAllowed,
        maxMarkup,
        isListed,
        mint: mintFromData,
        hasBeenSold,
        saleCount
      },
      transactionHistory: history,
      lifecycle: {
        minted: history.length > 0,
        totalTransactions: history.length,
        currentOwner: owner,
        priceHistory: {
          original: originalPrice,
          current: price,
          markup: originalPrice > 0 ? (((price - originalPrice) / originalPrice) * 100).toFixed(2) : '0.00'
        },
        resaleInfo: {
          count: saleCount,
          maxAllowed: 3,
          canResale: saleCount < 3,
          isListed
        },
        compliance: {
          antiScalpingActive: true,
          maxMarkup: maxMarkup,
          withinLimits: price <= (originalPrice * (1 + maxMarkup / 100))
        },
        explorerUrls: {
          mint: `https://explorer.solana.com/address/${mintAddress}?cluster=${CLUSTER || 'devnet'}`,
          program: `https://explorer.solana.com/address/${PROGRAM_ID.toString()}?cluster=${CLUSTER || 'devnet'}`,
          pda: `https://explorer.solana.com/address/${ticketPda.toBase58()}?cluster=${CLUSTER || 'devnet'}`
        }
      }
    };

    res.json({ success: true, lifecycle });
  } catch (error) {
    console.error('❌ Error getting ticket lifecycle:', error);
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🏭 Minting service running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('  POST /mint - Mint new ticket');
  console.log('  POST /list - List ticket for sale');
  console.log('  POST /transfer - Transfer NFT ownership');
  console.log('  GET /info/:mintAddress - Get ticket info');
  console.log('  GET /lifecycle/:mintAddress - Get complete ticket lifecycle');
});