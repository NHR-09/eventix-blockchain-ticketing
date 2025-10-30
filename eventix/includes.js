function loadNavbar() {
  const savedCity = localStorage.getItem("selectedCity");
  const wallet = localStorage.getItem("wallet");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === 'true';
  const user = isLoggedIn ? JSON.parse(localStorage.getItem("user")) : null;

  let authSection = '';
  if (isLoggedIn) {
    authSection = `
      <span style="color: var(--primary); margin-right: 15px;">Hi, ${user.name}</span>
      <button class="eventix-btn secondary" onclick="logoutUser()">Logout</button>
      <button class="eventix-btn connect-wallet" onclick="openWalletModal()">${wallet ? 'Wallet: ' + wallet.slice(0,6) + '...' + wallet.slice(-4) : 'Connect Wallet'}</button>
    `;
  } else {
    authSection = `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }

  const navbarHTML = `
  <nav class="eventix-navbar">
    <div class="eventix-logo" onclick="location.href='index.html'">Eventix</div>
    <div class="eventix-navlinks">
      <span class="city-display" onclick="openCityModal()">${savedCity ? '📍 ' + savedCity : '📍 Select City'}</span>
      <a href="index.html">Home</a>
      <a href="events.html">Events</a>
      <a href="mytickets.html">My Tickets</a>
      <a href="resale.html">Resale</a>
      <a href="about.html">About</a>
      ${authSection}
    </div>
  </nav>`;

  document.getElementById("navbar").innerHTML = navbarHTML;
}

function loadFooter() {
  const footerHTML = `
  <footer class="eventix-footer">
    <div class="footer-container">
      <div class="footer-left">
        <div class="footer-logo">Eventix</div>
        <div class="footer-links">
          <a href="#">Terms & Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
          <a href="#">List Your Event</a>
        </div>
        <p class="footer-note">
          By accessing this page, you confirm you agree to our Terms of Service and Privacy Policy.<br>
          All rights reserved © 2025 Eventix.
        </p>
      </div>
      <div class="footer-right">
        <div class="social-icons">
          <a href="#"><img src="whatsapp-logo-variant-svgrepo-com.svg" alt="WhatsApp"></a>
          <a href="#"><img src="facebook-svgrepo-com.svg" alt="Facebook"></a>
          <a href="#"><img src="instagram-svgrepo-com.svg" alt="Instagram"></a>
          <a href="#"><img src="twitter-svgrepo-com.svg" alt="X"></a>
          <a href="#"><img src="youtube-svgrepo-com.svg" alt="YouTube"></a>
        </div>
      </div>
    </div>
  </footer>`;

  document.getElementById("footer").innerHTML = footerHTML;
}

// Logout
function logoutUser(){
  localStorage.clear();
  alert("Logged out successfully!");
  location.href = "getstarted.html";
}

document.addEventListener("DOMContentLoaded", ()=>{
  if(document.getElementById("navbar")) loadNavbar();
  if(document.getElementById("footer")) loadFooter();

  if(typeof initNav === "function") initNav();
  if(typeof initWalletButtons === "function") initWalletButtons();
});
/* includes.js - injects navbar, footer, and wallet functions */

function loadNavbar() {
  const role = localStorage.getItem("role");
  const currentPage = window.location.pathname.split("/").pop(); 

  let navbarHTML = `
  <nav class="eventix-navbar">
    <div class="eventix-logo" onclick="location.href='index.html'">Eventix</div>
    <div class="eventix-navlinks">
      <span class="city-display">📍 Select City</span>
  `;

  if (role === "owner") {
    // Owner Navbar
    navbarHTML += `
      <a href="index.html" class="${currentPage==='index.html'?'active':''}">Home</a>
      <a href="events.html" class="${currentPage==='events.html'?'active':''}">Events</a>
      <a href="resale.html" class="${currentPage==='resale.html'?'active':''}">Resale</a>
      <a href="about.html" class="${currentPage==='about.html'?'active':''}">About</a>
      <a href="owner.html" class="${currentPage==='owner.html'?'active':''}">Dashboard</a>
      <a href="editabout.html" class="${currentPage==='editabout.html'?'active':''}">Edit About</a>
      <button onclick="logoutUser()" class="eventix-btn secondary">Logout</button>
    `;
  } else {
    // User Navbar
    navbarHTML += `
      <a href="index.html" class="${currentPage==='index.html'?'active':''}">Home</a>
      <a href="events.html" class="${currentPage==='events.html'?'active':''}">Events</a>
      <a href="mytickets.html" class="${currentPage==='mytickets.html'?'active':''}">My Tickets</a>
      <a href="resale.html" class="${currentPage==='resale.html'?'active':''}">Resale</a>
      <a href="about.html" class="${currentPage==='about.html'?'active':''}">About</a>
      <button class="eventix-btn connect-wallet" onclick="openWalletModal()">Connect Wallet</button>
    `;
  }

  navbarHTML += `
    </div>
  </nav>`;

  document.getElementById("navbar").innerHTML = navbarHTML;

  // If wallet already connected, update button text
  const wallet = localStorage.getItem("wallet");
  if(wallet && document.querySelector(".connect-wallet")){
    document.querySelector(".connect-wallet").innerText = "Wallet: " + wallet.slice(0,6) + "..." + wallet.slice(-4);
  }
}

function loadFooter() {
  const footerHTML = `
  <footer class="eventix-footer">
    <div class="footer-container">
      <div class="footer-left">
        <div class="footer-logo">Eventix</div>
        <div class="footer-links">
          <a href="#">Terms & Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
          <a href="#">List Your Event</a>
        </div>
        <p class="footer-note">
          By accessing this page, you confirm you agree to our Terms of Service and Privacy Policy.<br>
          All rights reserved © 2025 Eventix.
        </p>
      </div>
      <div class="footer-right">
        <div class="social-icons">
          <a href="#"><img src="whatsapp-logo-variant-svgrepo-com.svg" alt="WhatsApp"></a>
          <a href="#"><img src="facebook-svgrepo-com.svg" alt="Facebook"></a>
          <a href="#"><img src="instagram-svgrepo-com.svg" alt="Instagram"></a>
          <a href="#"><img src="twitter-svgrepo-com.svg" alt="X"></a>
          <a href="#"><img src="youtube-svgrepo-com.svg" alt="YouTube"></a>
        </div>
      </div>
    </div>
  </footer>`;

  document.getElementById("footer").innerHTML = footerHTML;
}

// Logout (full app logout)
function logoutUser(){
  localStorage.clear();
  alert("Logged out successfully!");
  location.href = "getstarted.html";
}

/* ---------------- WALLET FUNCTIONS ---------------- */
function openWalletModal(){
  document.getElementById("walletModal").style.display = "flex";
}
function closeWalletModal(){
  document.getElementById("walletModal").style.display = "none";
}

// Phantom Wallet
async function connectPhantom(){
  if(window.solana && window.solana.isPhantom){
    try {
      const resp = await window.solana.connect();
      const account = resp.publicKey.toString();
      localStorage.setItem("wallet", account);
      showWalletActions(account);
    } catch (err) {
      alert("Phantom connection rejected!");
    }
  } else {
    alert("Phantom not installed!");
  }
}

// MetaMask Wallet
async function connectMetaMask(){
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      localStorage.setItem("wallet", account);
      showWalletActions(account);
    } catch (err) {
      alert("MetaMask connection rejected!");
    }
  } else {
    alert("MetaMask not installed!");
  }
}

// Show Wallet Actions (QR + buy + disconnect)
function showWalletActions(account){
  document.getElementById("walletActions").style.display = "block";
  document.getElementById("walletAddress").innerText = "Address: " + account;

  if(document.querySelector(".connect-wallet")){
    document.querySelector(".connect-wallet").innerText = "Wallet: " + account.slice(0,6)+"..."+account.slice(-4);
  }

  // Generate QR Code
  const canvas = document.getElementById("walletQR");
  QRCode.toCanvas(canvas, account, function (error) {
    if (error) console.error(error);
  });
}

function disconnectWallet(){
  localStorage.removeItem("wallet");
  alert("Wallet disconnected!");
  location.reload();
}

// Buy SOL redirect
function buySol(){
  window.open("https://www.moonpay.com/buy/solana", "_blank");
}

/* Init */
document.addEventListener("DOMContentLoaded", ()=>{
  if(document.getElementById("navbar")) loadNavbar();
  if(document.getElementById("footer")) loadFooter();
});
/* includes.js - navbar, footer, wallet, booking */

function loadNavbar() {
  const role = localStorage.getItem("role");
  const currentPage = window.location.pathname.split("/").pop(); 

  let navbarHTML = `
  <nav class="eventix-navbar">
    <div class="eventix-logo" onclick="location.href='index.html'">Eventix</div>
    <div class="eventix-navlinks">
      <span class="city-display">📍 Select City</span>
  `;

  if (role === "owner") {
    navbarHTML += `
      <a href="index.html" class="${currentPage==='index.html'?'active':''}">Home</a>
      <a href="events.html" class="${currentPage==='events.html'?'active':''}">Events</a>
      <a href="resale.html" class="${currentPage==='resale.html'?'active':''}">Resale</a>
      <a href="about.html" class="${currentPage==='about.html'?'active':''}">About</a>
      <a href="owner.html" class="${currentPage==='owner.html'?'active':''}">Dashboard</a>
      <a href="editabout.html" class="${currentPage==='editabout.html'?'active':''}">Edit About</a>
      <button onclick="logoutUser()" class="eventix-btn secondary">Logout</button>
    `;
  } else {
    navbarHTML += `
      <a href="index.html" class="${currentPage==='index.html'?'active':''}">Home</a>
      <a href="events.html" class="${currentPage==='events.html'?'active':''}">Events</a>
      <a href="mytickets.html" class="${currentPage==='mytickets.html'?'active':''}">My Tickets</a>
      <a href="resale.html" class="${currentPage==='resale.html'?'active':''}">Resale</a>
      <a href="about.html" class="${currentPage==='about.html'?'active':''}">About</a>
      <button class="eventix-btn connect-wallet" onclick="openWalletModal()">Connect Wallet</button>
    `;
  }

  navbarHTML += `
    </div>
  </nav>`;

  document.getElementById("navbar").innerHTML = navbarHTML;

  const wallet = localStorage.getItem("wallet");
  if(wallet && document.querySelector(".connect-wallet")){
    document.querySelector(".connect-wallet").innerText = "Wallet: " + wallet.slice(0,6) + "..." + wallet.slice(-4);
  }
}

function loadFooter() {
  const footerHTML = `
  <footer class="eventix-footer">
    <div class="footer-container">
      <div class="footer-left">
        <div class="footer-logo">Eventix</div>
        <div class="footer-links">
          <a href="#">Terms & Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
          <a href="#">List Your Event</a>
        </div>
        <p class="footer-note">
          By accessing this page, you confirm you agree to our Terms of Service and Privacy Policy.<br>
          All rights reserved © 2025 Eventix.
        </p>
      </div>
      <div class="footer-right">
        <div class="social-icons">
          <a href="#"><img src="whatsapp-logo-variant-svgrepo-com.svg" alt="WhatsApp"></a>
          <a href="#"><img src="facebook-svgrepo-com.svg" alt="Facebook"></a>
          <a href="#"><img src="instagram-svgrepo-com.svg" alt="Instagram"></a>
          <a href="#"><img src="twitter-svgrepo-com.svg" alt="X"></a>
          <a href="#"><img src="youtube-svgrepo-com.svg" alt="YouTube"></a>
        </div>
      </div>
    </div>
  </footer>`;

  document.getElementById("footer").innerHTML = footerHTML;
}

function logoutUser(){
  localStorage.clear();
  alert("Logged out successfully!");
  location.href = "getstarted.html";
}

/* ---------- Wallet Modal ---------- */
function openWalletModal(){
  document.getElementById("walletModal").style.display = "flex";
}
function closeWalletModal(){
  document.getElementById("walletModal").style.display = "none";
}

async function connectPhantom(){
  if(window.solana && window.solana.isPhantom){
    try {
      const resp = await window.solana.connect();
      const account = resp.publicKey.toString();
      localStorage.setItem("wallet", account);
      showWalletActions(account);
    } catch (err) { alert("Phantom connection rejected!"); }
  } else alert("Phantom not installed!");
}

async function connectMetaMask(){
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      localStorage.setItem("wallet", account);
      showWalletActions(account);
    } catch (err) { alert("MetaMask connection rejected!"); }
  } else alert("MetaMask not installed!");
}

function showWalletActions(account){
  document.getElementById("walletActions").style.display = "block";
  document.getElementById("walletAddress").innerText = "Address: " + account;
  if(document.querySelector(".connect-wallet")){
    document.querySelector(".connect-wallet").innerText = "Wallet: " + account.slice(0,6)+"..."+account.slice(-4);
  }
  const canvas = document.getElementById("walletQR");
  QRCode.toCanvas(canvas, account, function (error) { if (error) console.error(error); });
}

function disconnectWallet(){
  localStorage.removeItem("wallet");
  alert("Wallet disconnected!");
  location.reload();
}

function buySol(){
  window.open("https://www.moonpay.com/buy/solana", "_blank");
}

/* ---------- Booking ---------- */
function bookTicket(eventName){
  const wallet = localStorage.getItem("wallet");
  if(!wallet){
    alert("Please connect your wallet before booking!");
    openWalletModal();
    return;
  }
  window.location.href = "book.html?event=" + encodeURIComponent(eventName);
}

/* ---------- City Modal ---------- */
function openCityModal(){
  if(!document.getElementById("cityModal")){
    const modalHTML = `
    <div id="cityModal" class="city-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:2000;">
      <div style="background:#fff;border-radius:12px;padding:32px;width:90%;max-width:400px;text-align:center;">
        <h2 style="margin-bottom:20px;color:#6c47ff;">Select Your City</h2>
        <select id="citySelect" style="width:100%;padding:12px;border-radius:8px;border:1px solid #ccc;font-size:1rem;margin-bottom:20px;">
          <option value="" disabled selected>Choose a city...</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Pune">Pune</option>
          <option value="Delhi">Delhi</option>
          <option value="Bengaluru">Bengaluru</option>
          <option value="Hyderabad">Hyderabad</option>
        </select>
        <button onclick="saveCity()" class="eventix-btn">Continue</button>
        <button onclick="closeCityModal()" style="margin-left:10px;background:#ccc;color:#333;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">Cancel</button>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  document.getElementById("cityModal").style.display = "flex";
}

function closeCityModal(){
  document.getElementById("cityModal").style.display = "none";
}

function saveCity(){
  const city = document.getElementById("citySelect").value;
  if(!city){
    alert("Please select a city!");
    return;
  }
  localStorage.setItem("selectedCity", city);
  closeCityModal();
  loadNavbar();
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  if(document.getElementById("navbar")) loadNavbar();
  if(document.getElementById("footer")) loadFooter();
});
