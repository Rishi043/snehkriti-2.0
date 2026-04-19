import { updateAllBadges, addToCart } from './cart.js';
import { showToast } from './main.js';
import { products } from './products.js';

updateAllBadges();

// ── CONFIG ────────────────────────────────────────────────────────────────────
const MAX_FREE_CREDITS = 200;
const CREDITS_KEY = 'snehkriti_tryon_credits';

// ── CREDIT COUNTER ────────────────────────────────────────────────────────────
function getCreditsUsed() {
  return parseInt(localStorage.getItem(CREDITS_KEY) || '0');
}
function useCredit() {
  localStorage.setItem(CREDITS_KEY, getCreditsUsed() + 1);
  updateCreditDisplay();
}
function updateCreditDisplay() {
  const used = getCreditsUsed();
  const remaining = MAX_FREE_CREDITS - used;
  const el = document.getElementById('credit-counter');
  if (!el) return;
  el.textContent = `✨ ${remaining} free try-ons remaining`;
  el.style.color = remaining <= 20 ? '#e91e63' : '#d4a373';
}

// ── STATE ─────────────────────────────────────────────────────────────────────
let userPhotoBase64 = null;
let selectedProduct = null;

// ── PRODUCT GRID ──────────────────────────────────────────────────────────────
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
  // Resize image to max 1024px to avoid payload too large errors
  const img = new Image();
  const reader = new FileReader();
  reader.onload = ev => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max = 1024;
      let w = img.width, h = img.height;
      if (w > max || h > max) {
        if (w > h) { h = Math.round(h * max / w); w = max; }
        else { w = Math.round(w * max / h); h = max; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      userPhotoBase64 = canvas.toDataURL('image/jpeg', 0.85);
      document.getElementById('preview-img').src = userPhotoBase64;
      document.getElementById('upload-placeholder').classList.add('hidden');
      document.getElementById('upload-preview').classList.remove('hidden');
      checkReady();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

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

  const remaining = MAX_FREE_CREDITS - getCreditsUsed();
  if (remaining <= 0) {
    showError('Free try-on credits exhausted. Please contact Snehkriti to top up.');
    return;
  }

  showLoading();

  try {
    const garmentUrl = `https://snehkriti-2-0.vercel.app${selectedProduct.images[0]}`;

    const response = await fetch('/api/tryon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        human_img: userPhotoBase64,
        garm_img: garmentUrl,
        garment_des: selectedProduct.name
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || JSON.stringify(data));

    const resultUrl = await pollReplicate(data.id);
    useCredit();
    showResult(resultUrl);

  } catch (err) {
    console.error('Try-on error:', err);
    showError(err.message || 'Something went wrong. Please try again.');
  }
};

async function pollReplicate(id) {
  const maxAttempts = 40;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await fetch(`/api/tryon-status?id=${id}`);
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

window.downloadResult = function() {
  const img = document.getElementById('result-img').src;
  const a = document.createElement('a');
  a.href = img; a.download = `snehkriti-tryon-${selectedProduct.name}.jpg`;
  a.click();
};

window.addSelectedToCart = function() {
  if (!selectedProduct) return;
  addToCart(selectedProduct, '', 1);
  showToast('Added to cart! 🛍️');
};

// Init credit display
updateCreditDisplay();
