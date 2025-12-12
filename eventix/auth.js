// Authentication functions
const API_BASE = 'http://localhost:3001/api';

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
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true');
      alert('Login successful!');
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    alert('Login failed. Please try again.');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

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

// Logout function
function logoutUser() {
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.clear();
  alert('Logged out successfully!');
  window.location.href = 'login.html';
}