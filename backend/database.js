import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDbjTegm1Ux01HZCgqt1_IdsJxbCoeGsM",
  authDomain: "eventix-blockchain.firebaseapp.com",
  projectId: "eventix-blockchain",
  storageBucket: "eventix-blockchain.firebasestorage.app",
  messagingSenderId: "864234423994",
  appId: "1:864234423994:web:42c6d42f278a1c5889a483"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections
const USERS_COLLECTION = 'users';
const TICKETS_COLLECTION = 'tickets';
const RESALE_HISTORY_COLLECTION = 'resale_history';

// Memory fallback storage
let memoryUsers = [];
let memoryTickets = [];
let memoryResaleHistory = [];
let useMemory = false;

// Initialize database connection
export async function initDatabase() {
  console.log('🔄 Initializing Firestore...');
  
  try {
    // Test Firestore connection
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    console.log('✅ Firestore connected successfully');
    useMemory = false;
  } catch (error) {
    console.log('❌ Firestore connection failed, using memory storage:', error.message);
    useMemory = true;
  }
}

// User operations
export async function createUser(name, email, hashedPassword) {
  if (useMemory) {
    const user = { id: memoryUsers.length + 1, name, email, password: hashedPassword };
    memoryUsers.push(user);
    return user;
  }
  
  try {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    });
    return { id: docRef.id, name, email };
  } catch (error) {
    throw error;
  }
}

export async function findUserByEmail(email) {
  if (useMemory) {
    return memoryUsers.find(u => u.email === email);
  }
  
  try {
    const q = query(collection(db, USERS_COLLECTION), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
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
    await addDoc(collection(db, TICKETS_COLLECTION), {
      mintAddress: ticketData.mint,
      name: ticketData.name,
      description: ticketData.description,
      eventDate: ticketData.eventDate,
      price: ticketData.price,
      originalPrice: ticketData.originalPrice,
      image: ticketData.image,
      isListed: ticketData.isListed || false,
      owner: ticketData.owner,
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
    console.log(`🔍 Firestore query: Looking for tickets with owner = "${walletAddress}"`);
    
    const q = query(
      collection(db, TICKETS_COLLECTION), 
      where("owner", "==", walletAddress)
    );
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Firestore query returned ${querySnapshot.size} documents`);
    
    const tickets = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Found ticket document:`, {
        id: doc.id,
        owner: data.owner,
        name: data.name,
        mintAddress: data.mintAddress
      });
      
      tickets.push({
        id: data.mintAddress,
        mint: data.mintAddress,
        name: data.name,
        description: data.description,
        eventDate: data.eventDate,
        price: data.price,
        originalPrice: data.originalPrice,
        image: data.image,
        isListed: data.isListed,
        owner: data.owner,
        createdAt: data.createdAt
      });
    });
    
    console.log(`✅ Returning ${tickets.length} tickets to frontend`);
    return tickets;
  } catch (error) {
    console.error('❌ Firestore getUserTickets error:', error);
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
    const q = query(collection(db, TICKETS_COLLECTION), where("mintAddress", "==", mintAddress));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        price: price,
        isListed: isListed,
        updatedAt: new Date()
      });
    }
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
    const q = query(collection(db, TICKETS_COLLECTION), where("mintAddress", "==", mintAddress));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        owner: newOwner,
        isListed: false,
        updatedAt: new Date()
      });
    }
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
    const q = query(
      collection(db, TICKETS_COLLECTION), 
      where("isListed", "==", true)
    );
    const querySnapshot = await getDocs(q);
    
    const tickets = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tickets.push({
        id: data.mintAddress,
        mint: data.mintAddress,
        name: data.name,
        description: data.description,
        eventDate: data.eventDate,
        price: data.price,
        originalPrice: data.originalPrice,
        image: data.image,
        isListed: data.isListed,
        owner: data.owner,
        createdAt: data.createdAt
      });
    });
    
    return tickets;
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
    await addDoc(collection(db, RESALE_HISTORY_COLLECTION), {
      ticketId: historyData.ticketId,
      fromWallet: historyData.fromWallet,
      toWallet: historyData.toWallet,
      price: historyData.price,
      resaleNumber: historyData.resaleNumber,
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
    const q = query(collection(db, RESALE_HISTORY_COLLECTION), where("ticketId", "==", ticketId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    return memoryResaleHistory.filter(h => h.ticketId === ticketId).length;
  }
}