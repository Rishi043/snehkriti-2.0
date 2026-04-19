import { updateAllBadges, addToCart } from './cart.js';
import { showToast } from './main.js';
import { products } from './products.js';

updateAllBadges();

const BASE = 'https://yisol-idm-vton.hf.space';
const MAX_FREE_CREDITS = 200;
const CREDITS_KEY = 'snehkriti_tryon_credits';

function getCreditsUsed() { return parseInt(localStorage.getItem(CREDITS_KEY) || '0'); }
function useCredit() { localStorage.setItem(CREDITS_KEY, getCreditsUsed() + 1); updateCreditDisplay(); }
function updateCreditDisplay() {
  const remaining = MAX_FREE_CREDITS - getCreditsUsed();
  const el = document.getElementById('credit-counter');
  if (!el) return;
  el.textContent = `✨ ${remaining} free try-ons remaining`;
  el.style.color = remaining <= 20 ? '#e91e63' : '#d4a373';
}

let userPhotoFile = null;
let userPhotoBase64 = null;
let selectedProduct = null;

// ── PRODUCT GRID ──────────────────────────────────────────────────────────────
const tryOnProducts = products.filter(p => p.images[0]);
const grid = document.getElementById('product-grid');
grid.innerHTML = tryOnProducts.map(p => `
  <div class="product-card-try" id="pcard-${p.id}" onclick="selectProduct(${p.id})">
    <img src="${p.images[0]}" alt="${p.name}" class="w-full rounded-xl object-cover" style="aspect-ratio:1;">
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
  userPhotoFile = file;
  const img = new Image();
  const reader = new FileReader();
  reader.onload = ev => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max = 768;
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
      // convert base64 to File for upload
      canvas.toBlob(blob => { userPhotoFile = new File([blob], 'human.jpg', { type: 'image/jpeg' }); }, 'image/jpeg', 0.85);
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

function checkReady() {
  const btn = document.getElementById('tryon-btn');
  const hint = document.getElementById('btn-hint');
  if (userPhotoFile && selectedProduct) {
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
    hint.textContent = `Ready! Tap to try on "${selectedProduct.name}"`;
  }
}

// ── UPLOAD FILE TO HF SPACE ───────────────────────────────────────────────────
async function uploadToHF(file) {
  const form = new FormData();
  form.append('files', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Image upload to HF failed');
  const paths = await res.json();
  return paths[0]; // returns the server path
}

// ── FETCH GARMENT AS BLOB AND UPLOAD ─────────────────────────────────────────
async function uploadGarmentToHF(url) {
  // Use our proxy to avoid CORS when fetching garment image
  const res = await fetch(`/api/fetch-image?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Failed to fetch garment image');
  const blob = await res.blob();
  const file = new File([blob], 'garment.jpg', { type: 'image/jpeg' });
  return uploadToHF(file);
}

// ── TRY ON ────────────────────────────────────────────────────────────────────
window.startTryOn = async function() {
  if (!userPhotoFile || !selectedProduct) return;
  if (getCreditsUsed() >= MAX_FREE_CREDITS) {
    showError('Free try-on credits exhausted. Please contact Snehkriti to top up.');
    return;
  }

  showLoading();

  try {
    const session_hash = Math.random().toString(36).slice(2);
    const garmentUrl = `https://snehkriti-2-0.vercel.app${selectedProduct.images[0]}`;

    // Upload both images to HF Space
    updateLoadingText('Uploading your photo... 📸');
    const humanPath = await uploadToHF(userPhotoFile);

    updateLoadingText('Uploading garment... 👕');
    const garmPath = await uploadGarmentToHF(garmentUrl);

    updateLoadingText('AI is working its magic... ✨ (30-60 sec)');

    // Submit job to HF queue
    const joinRes = await fetch(`${BASE}/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fn_index: 2,
        session_hash,
        data: [
          { background: { path: humanPath, url: `${BASE}/file=${humanPath}`, meta: { _type: 'gradio.FileData' } }, layers: [], composite: null },
          { path: garmPath, url: `${BASE}/file=${garmPath}`, meta: { _type: 'gradio.FileData' } },
          selectedProduct.name,
          true, false, 30, 42
        ]
      })
    });

    if (!joinRes.ok) throw new Error('Failed to submit job to AI');

    // Poll for result
    const resultUrl = await pollHF(session_hash);
    useCredit();
    showResult(resultUrl);

  } catch (err) {
    console.error('Try-on error:', err);
    showError(err.message || 'Something went wrong. Please try again.');
  }
};

async function pollHF(session_hash) {
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 4000));
    const res = await fetch(`${BASE}/queue/status?session_hash=${session_hash}`);
    if (!res.ok) continue;
    const data = await res.json();
    if (data.status === 'complete' && data.output?.data?.[0]) {
      const out = data.output.data[0];
      return out?.url || (out?.path ? `${BASE}/file=${out.path}` : null);
    }
    if (data.status === 'error') throw new Error(data.output || 'AI processing failed');
    // Update queue position
    if (data.queue_size > 0) updateLoadingText(`In queue... position ${data.queue_size} ⏳`);
  }
  throw new Error('Timed out — please try again in a moment.');
}

function updateLoadingText(msg) {
  const el = document.querySelector('#result-loading p');
  if (el) el.textContent = msg;
}

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

updateCreditDisplay();
