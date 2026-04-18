import { updateAllBadges, addToCart } from './cart.js';
import { showToast } from './main.js';
import { products } from './products.js';

updateAllBadges();

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Get your free API key from https://fashn.ai → Dashboard → API Keys
// Paste it below (free tier = 200 credits, 1 credit per try-on)
const FASHN_API_KEY = 'YOUR_FASHN_API_KEY';

// ── STATE ─────────────────────────────────────────────────────────────────────
let userPhotoBase64 = null;
let selectedProduct = null;

// ── PRODUCT GRID ──────────────────────────────────────────────────────────────
// Only show tees and hoodies (wearable items)
const tryOnProducts = products.filter(p => p.images[0]);

const grid = document.getElementById('product-grid');
grid.innerHTML = tryOnProducts.map(p => `
  <div class="product-card-try" id="pcard-${p.id}" onclick="selectProduct(${p.id})">
    <img src="${p.images[0]}" alt="${p.name}"
      class="w-full rounded-xl object-cover" style="aspect-ratio:1;">
    <p class="handwritten text-xs text-center text-[#5e503f] mt-1 px-1 leading-tight">${p.name}</p>
  </div>`).join('');

window.selectProduct = function(id) {
  selectedProduct = tryOnProducts.find(p => p.id === id);
  document.querySelectorAll('.product-card-try').forEach(el => el.classList.remove('selected'));
  document.getElementById(`pcard-${id}`).classList.add('selected');
  checkReady();
};

// ── PHOTO UPLOAD ──────────────────────────────────────────────────────────────
const photoInput = document.getElementById('photo-input');
const uploadZone = document.getElementById('upload-zone');

photoInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    userPhotoBase64 = ev.target.result; // full data URL
    document.getElementById('preview-img').src = userPhotoBase64;
    document.getElementById('upload-placeholder').classList.add('hidden');
    document.getElementById('upload-preview').classList.remove('hidden');
    checkReady();
  };
  reader.readAsDataURL(file);
});

// Drag and drop
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) { photoInput.files = e.dataTransfer.files; photoInput.dispatchEvent(new Event('change')); }
});

// ── ENABLE BUTTON ─────────────────────────────────────────────────────────────
function checkReady() {
  const btn = document.getElementById('tryon-btn');
  const hint = document.getElementById('btn-hint');
  if (userPhotoBase64 && selectedProduct) {
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
    hint.textContent = `Ready! Tap to try on "${selectedProduct.name}"`;
  }
}

// ── TRY ON ────────────────────────────────────────────────────────────────────
window.startTryOn = async function() {
  if (!userPhotoBase64 || !selectedProduct) return;

  if (FASHN_API_KEY === 'YOUR_FASHN_API_KEY') {
    showError('Please add your Fashn.ai API key in tryOnPage.js to use this feature.');
    return;
  }

  showLoading();

  try {
    // Step 1: Start the try-on job
    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FASHN_API_KEY}`
      },
      body: JSON.stringify({
        model_image: userPhotoBase64,
        garment_image: selectedProduct.images[0].startsWith('/')
          ? window.location.origin + selectedProduct.images[0]
          : selectedProduct.images[0],
        category: selectedProduct.category === 'Hoodies' ? 'tops' : 'tops',
        mode: 'balanced' // balanced = good quality, doesn't use extra credits
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || err.message || 'API error');
    }

    const { id } = await response.json();

    // Step 2: Poll for result
    const resultUrl = await pollResult(id);
    showResult(resultUrl);

  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  }
};

async function pollResult(jobId) {
  const maxAttempts = 30; // 30 × 3s = 90s max wait
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await fetch(`https://api.fashn.ai/v1/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${FASHN_API_KEY}` }
    });
    const data = await res.json();
    if (data.status === 'completed') return data.output[0];
    if (data.status === 'failed') throw new Error(data.error || 'Try-on failed');
  }
  throw new Error('Timed out. Please try again.');
}

// ── UI STATES ─────────────────────────────────────────────────────────────────
function showLoading() {
  document.getElementById('result-idle').classList.add('hidden');
  document.getElementById('result-done').classList.add('hidden');
  document.getElementById('result-error').classList.add('hidden');
  document.getElementById('result-loading').classList.remove('hidden');
  document.getElementById('tryon-btn').disabled = true;
  document.getElementById('tryon-btn').textContent = '⏳ Processing...';
}

function showResult(url) {
  document.getElementById('result-loading').classList.add('hidden');
  document.getElementById('result-img').src = url;
  document.getElementById('result-done').classList.remove('hidden');
  document.getElementById('tryon-btn').disabled = false;
  document.getElementById('tryon-btn').textContent = '✨ Try It On';
  showToast('Looking great! 🎉');
}

function showError(msg) {
  document.getElementById('result-loading').classList.add('hidden');
  document.getElementById('result-idle').classList.add('hidden');
  document.getElementById('error-msg').textContent = msg;
  document.getElementById('result-error').classList.remove('hidden');
  document.getElementById('tryon-btn').disabled = false;
  document.getElementById('tryon-btn').textContent = '✨ Try It On';
}

window.resetResult = function() {
  document.getElementById('result-error').classList.add('hidden');
  document.getElementById('result-idle').classList.remove('hidden');
};

// ── DOWNLOAD ──────────────────────────────────────────────────────────────────
window.downloadResult = function() {
  const img = document.getElementById('result-img').src;
  const a = document.createElement('a');
  a.href = img;
  a.download = `snehkriti-tryon-${selectedProduct.name}.jpg`;
  a.click();
};

// ── ADD TO CART ───────────────────────────────────────────────────────────────
window.addSelectedToCart = function() {
  if (!selectedProduct) return;
  addToCart(selectedProduct, '', 1);
  showToast('Added to cart! 🛍️');
};
