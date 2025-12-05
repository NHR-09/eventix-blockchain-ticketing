// Currency conversion utilities
const SOL_TO_INR_RATE = 15000; // 1 SOL ≈ ₹15,000 (update as needed)

// Convert SOL to INR
function solToInr(solAmount) {
  return Math.round(solAmount * SOL_TO_INR_RATE);
}

// Convert INR to SOL
function inrToSol(inrAmount) {
  return parseFloat((inrAmount / SOL_TO_INR_RATE).toFixed(4));
}

// Format INR currency
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format SOL currency
function formatSOL(amount) {
  return `${parseFloat(amount).toFixed(3)} SOL`;
}

// Display price with both currencies
function formatDualPrice(solAmount) {
  const inrAmount = solToInr(solAmount);
  return `${formatINR(inrAmount)} <span style="color: #6b4c7a; font-size: 0.9em;">(${formatSOL(solAmount)})</span>`;
}

// Get current SOL rate (you can replace with real API)
async function updateSolRate() {
  try {
    // Replace with real API call to get current SOL/INR rate
    // const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=inr');
    // const data = await response.json();
    // SOL_TO_INR_RATE = data.solana.inr;
    console.log(`Current SOL rate: ₹${SOL_TO_INR_RATE}`);
  } catch (error) {
    console.log('Using default SOL rate');
  }
}

// Initialize currency system
updateSolRate();