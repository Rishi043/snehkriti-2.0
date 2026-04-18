import { updateAllBadges, addToCart } from './cart.js';
import { showToast } from './main.js';
import { products } from './products.js';

updateAllBadges();

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Get your free API key from https://replicate.com → Sign in with GitHub/Google
// → Account Settings → API Tokens → Create token
// Free tier gives enough credits to test
const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY || '';

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

  if (!REPLICATE_API_KEY) {
    showError('Please add your Replicate API key in tryOnPage.js to use this feature.');
    return;
  }

  showLoading();

  try {
    // garment image must be a public URL
    const garmentUrl = `https://snehkriti-2-0.vercel.app${selectedProduct.images[0]}`;

    // strip data URL prefix for human image
    const base64Image = userPhotoBase64.split(',')[1];

    // Use IDM-VTON model on Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REPLICATE_API_KEY}`
      },
      body: JSON.stringify({
        version: 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4',
        input: {
          human_img: userPhotoBase64,
          garm_img: garmentUrl,
          garment_des: selectedProduct.name,
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: 42
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || err.message || 'API error');
    }

    const prediction = await response.json();

    // Poll for result
    const resultUrl = await pollReplicate(prediction.id);
    showResult(resultUrl);

  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
    console.error('Try-on error:', err);
  }
};

async function pollReplicate(id) {
  const maxAttempts = 40;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` }
    });
    const data = await res.json();
    if (data.status === 'succeeded') return Array.isArray(data.output) ? data.output[0] : data.output;
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
