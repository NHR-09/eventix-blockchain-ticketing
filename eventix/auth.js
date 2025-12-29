// Authentication functions with Firebase integration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api'
  : 'https://your-backend-url.com/api';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDbjTegm1Ux01HZCgqt1_IdsJxbCoeGsM",
  authDomain: "eventix-blockchain.firebaseapp.com",
  projectId: "eventix-blockchain",
  storageBucket: "eventix-blockchain.firebasestorage.app",
  messagingSenderId: "864234423994",
  appId: "1:864234423994:web:42c6d42f278a1c5889a483",
  measurementId: "G-DYN50JDBZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Try Firebase Auth first
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Store Firebase user data
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || email.split('@')[0],
      provider: 'firebase'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('authProvider', 'firebase');
    alert('Login successful!');
    window.location.href = 'index.html';
    
  } catch (firebaseError) {
    console.log('Firebase auth failed, trying backend:', firebaseError.message);
    
    // Fallback to existing backend auth
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('authProvider', 'backend');
        alert('Login successful!');
        window.location.href = 'index.html';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Try Firebase Auth first
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
    
  } catch (firebaseError) {
    console.log('Firebase registration failed, trying backend:', firebaseError.message);
    
    // Fallback to existing backend registration
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  }
}

// Update user profile
async function updateUserProfile(userId, walletAddress, city) {
  try {
    const response = await fetch(`${API_BASE}/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address: walletAddress, city })
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Profile update failed:', error);
    return false;
  }
}

// Check if user is logged in
function isUserLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Firebase Social Login Functions
async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      provider: 'google'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('authProvider', 'firebase');
    alert('Google login successful!');
    window.location.href = 'index.html';
  } catch (error) {
    alert('Google login failed: ' + error.message);
  }
}

async function loginWithTwitter() {
  try {
    const result = await signInWithPopup(auth, twitterProvider);
    const user = result.user;
    
    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      provider: 'twitter'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('authProvider', 'firebase');
    alert('Twitter login successful!');
    window.location.href = 'index.html';
  } catch (error) {
    alert('Twitter login failed: ' + error.message);
  }
}

// Enhanced Logout function
async function logoutUser() {
  const authProvider = localStorage.getItem('authProvider');
  
  if (authProvider === 'firebase') {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase signout error:', error);
    }
  }
  
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('authProvider');
  localStorage.clear();
  alert('Logged out successfully!');
  window.location.href = 'getstarted.html';
}

// Auth State Listener
onAuthStateChanged(auth, (user) => {
  if (user && !localStorage.getItem('isLoggedIn')) {
    // User is signed in via Firebase but not in localStorage
    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL,
      provider: 'firebase'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('authProvider', 'firebase');
  }
});

// Make functions globally available
window.loginWithGoogle = loginWithGoogle;
window.loginWithTwitter = loginWithTwitter;
window.logoutUser = logoutUser;